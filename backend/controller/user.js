import User from "../models/User.js";
import Notification from "../models/Notification.js";
import Recommend from "../models/Recommend.js";

import bcrypt from "bcryptjs";
import { io } from "../server.js";
import { getUserSocketId } from "../socket/socket.js";

export const getUserProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserProfile: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const searchTerm = req.query.search;

    if (!searchTerm || searchTerm.trim().length < 1) {
      return res.json({ success: true, data: [] });
    }

    // Get current user with their relationship arrays
    const currentUser = await User.findById(req.user._id);

    // Find users matching search term
    const users = await User.find({
      username: { $regex: searchTerm, $options: "i" },
      _id: { $ne: req.user._id },
    })
      .select("username _id")
      .limit(10);

    // Add friendship status to each user
    const usersWithStatus = users.map(user => {
      // Check if this user is in your following array (you're friends)
      const isFriend = currentUser.following.some(
        friendId => friendId.toString() === user._id.toString()
      );

      // Check if you already sent them a request
      const isPendingRequest = currentUser.sentRequests.some(
        requestId => requestId.toString() === user._id.toString()
      );

      return {
        _id: user._id,
        username: user.username,
        isFriend: isFriend,
        isPendingRequest: isPendingRequest,
      };
    });

    res.json({ success: true, data: usersWithStatus });
  } catch (error) {
    console.log("Error in searchUsers:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getFriends = async (req, res) => {
  try {
    // Query for friends
    const friends = await User.find({
      _id: { $in: req.user.following },
    }).select("username _id");

    // Format and return the data
    res.status(200).json({
      success: true,
      data: friends,
    });
  } catch (error) {
    console.log("Error in getFriends:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const removeFriend = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = await User.findById(req.user._id);
    const friendUser = await User.findById(id);

    // Validate that both users exist
    if (!currentUser || !friendUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if they are actually friends
    if (!currentUser.following.includes(id)) {
      return res
        .status(400)
        .json({ error: "You are not friends with this user" });
    }

    // Remove from both users' following arrays (bidirectional)
    currentUser.following = currentUser.following.filter(
      friendId => friendId.toString() !== id
    );
    friendUser.following = friendUser.following.filter(
      friendId => friendId.toString() !== req.user._id.toString()
    );

    // Save both user documents
    await currentUser.save();
    await friendUser.save();

    // Emit socket events to both users
    const friendSocketId = getUserSocketId(id);
    if (friendSocketId) {
      io.to(friendSocketId).emit("friendRemoved", {
        removedBy: req.user._id,
      });
    }

    // Also notify the current user (for multi-device sync)
    const currentUserSocketId = getUserSocketId(req.user._id.toString());
    if (currentUserSocketId) {
      io.to(currentUserSocketId).emit("friendRemoved", {
        removedFriendId: id,
      });
    }

    // Return success response
    res.status(200).json({ message: "Friend removed successfully" });
  } catch (error) {
    console.log("Error in removeFriend:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    // Check if you're trying to friend yourself
    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ error: "You can't send a friend request to yourself" });
    }

    if (!userToModify || !currentUser)
      return res.status(400).json({ error: "User not found" });

    // Check if friend request already sent
    if (currentUser.sentRequests.includes(id))
      return res.status(400).json({ error: "Friend request already sent" });

    // Check if already friends
    if (currentUser.following.includes(id))
      return res
        .status(400)
        .json({ error: "You are already friends with this user" });

    // Add to request arrays
    currentUser.sentRequests.push(id);
    userToModify.pendingRequests.push(req.user._id);

    // Save both users
    await currentUser.save();
    await userToModify.save();

    //Emit socket event to recipient
    const recipientSocketId = getUserSocketId(id);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("newFriendRequest", {
        senderId: req.user._id,
        senderUsername: currentUser.username,
      });
    }

    // Return success response
    res.status(200).json({ message: "Friend request sent successfully" });
  } catch (error) {
    console.log("Error in sendFriendRequest: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    //extend and find users
    const { id } = req.params;
    const currentUser = await User.findById(req.user._id);
    const requestingUser = await User.findById(id);

    // Validate that both users exist
    if (!currentUser || !requestingUser) {
      return res.status(400).json({ error: "User not found" });
    }
    // Verify the friend request exists
    if (!currentUser.pendingRequests.includes(id)) {
      return res
        .status(400)
        .json({ error: "No friend request found from this user" });
    }
    // Remove the request from pending arrays
    currentUser.pendingRequests = currentUser.pendingRequests.filter(
      requestId => requestId.toString() !== id
    );
    requestingUser.sentRequests = requestingUser.sentRequests.filter(
      requestId => requestId.toString() !== req.user._id.toString()
    );
    // Add both users to each other's friends lists
    currentUser.following.push(id);
    requestingUser.following.push(req.user._id);

    // Save both user documents
    await currentUser.save();
    await requestingUser.save();

    // Create notification for the person who sent the request
    const notification = new Notification({
      from: req.user._id, //person who accepted
      to: id, //Person who sent
      type: "friend_request_accepted",
      read: false,
    });
    await notification.save();

    // Emit socket event to the requesting user
    const requesterSocketId = getUserSocketId(id);
    if (requesterSocketId) {
      io.to(requesterSocketId).emit("friendRequestAccepted", {
        acceptorId: req.user._id,
        acceptorUsername: currentUser.username,
        notification: notification,
      });
    }
    // Also emit to the acceptor (current user) so their friends list updates
    const acceptorSocketId = getUserSocketId(req.user._id.toString());
    if (acceptorSocketId) {
      io.to(acceptorSocketId).emit("friendRequestAccepted", {
        acceptorId: id,
        acceptorUsername: requestingUser.username,
      });
    }

    // Return success response
    res.status(200).json({ message: "Friend request accepted successfully" });
  } catch (error) {
    console.log("Error in acceptFriendRequest: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const declineFriendRequest = async (req, res) => {
  try {
    // Extract and find users
    const { id } = req.params;
    const currentUser = await User.findById(req.user._id);
    const requestingUser = await User.findById(id);

    // Validate that both users exist
    if (!currentUser || !requestingUser) {
      return res.status(400).json({ error: "User not found" });
    }

    // Verify the friend request exists
    if (!currentUser.pendingRequests.includes(id)) {
      return res
        .status(400)
        .json({ error: "No friend request found from this user" });
    }

    // Remove the request from arrays (but don't create friendship)
    currentUser.pendingRequests = currentUser.pendingRequests.filter(
      requestId => requestId.toString() !== id
    );
    requestingUser.sentRequests = requestingUser.sentRequests.filter(
      requestId => requestId.toString() !== req.user._id.toString()
    );

    // Save both users and return response
    await currentUser.save();
    await requestingUser.save();

    // Emit socket event to the requesting user (silent removal)
    const requesterSocketId = getUserSocketId(id);
    if (requesterSocketId) {
      io.to(requesterSocketId).emit("friendRequestDeclined", {
        declinedBy: req.user._id,
      });
    }

    res.status(200).json({ message: "Friend request declined" });
  } catch (error) {
    console.log("Error in declineFriendRequest:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    // Query for pending requests
    const pendingRequestUsers = await User.find({
      _id: { $in: req.user.pendingRequests },
    }).select("username _id");

    // Format and return the data
    res.status(200).json({
      success: true,
      data: pendingRequestUsers,
    });
  } catch (error) {
    console.log("Error in getPendingRequests:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { email, username, currentPassword, newPassword, bio, link } = req.body;
  // let { profileImg, coverImg } = req.body;

  const userId = req.user._id;

  try {
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (
      (!newPassword && currentPassword) ||
      (!currentPassword && newPassword)
    ) {
      return res.status(400).json({
        error: "Please provide both current password and new password",
      });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch)
        return res.status(400).json({ error: "Current password is incorrect" });
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters long" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // if (profileImg) {
    //   if (user.profileImg) {
    //     // https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
    //     await cloudinary.uploader.destroy(
    //       user.profileImg.split("/").pop().split(".")[0]
    //     );
    //   }

    //   const uploadedResponse = await cloudinary.uploader.upload(profileImg);
    //   profileImg = uploadedResponse.secure_url;
    // }

    // if (coverImg) {
    //   if (user.coverImg) {
    //     await cloudinary.uploader.destroy(
    //       user.coverImg.split("/").pop().split(".")[0]
    //     );
    //   }

    //   const uploadedResponse = await cloudinary.uploader.upload(coverImg);
    //   coverImg = uploadedResponse.secure_url;
    // }

    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    // user.profileImg = profileImg || user.profileImg;
    // user.coverImg = coverImg || user.coverImg;

    user = await user.save();

    // password should be null in response
    user.password = null;

    return res.status(200).json(user);
  } catch (error) {
    console.log("Error in updateUser: ", error.message);
    res.status(500).json({ error: error.message });
  }
};
export const getUserRecommendations = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const recommendations = await Recommend.find({ user: user._id });
    res.status(200).json({ success: true, data: recommendations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
