import User from "../models/User.js";
import Notification from "../models/Notification.js";
import Recommend from "../models/Recommend.js";

import bcrypt from "bcryptjs";

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
    // console.log("Search endpoint hit with term:", req.query.search);
    if (!searchTerm || searchTerm.trim().length < 1) {
      return res.json({ success: true, data: [] });
    }

    const users = await User.find({
      username: { $regex: searchTerm, $options: "i" },
      _id: { $ne: req.user._id },
    })
      .select("username _id")
      .limit(10);

    res.json({ success: true, data: users });
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
