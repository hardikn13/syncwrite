"use server";

import { users } from "@clerk/clerk-sdk-node"; // Correct Clerk import
import { parseStringify } from "../utils";
import { liveblocks } from "../liveblocks";

export const getClerkUsers = async ({ userIds }: { userIds: string[] }) => {
  try {
    if (!userIds || userIds.length === 0) {
      console.warn("No userIds provided, returning empty array.");
      return [];
    }

    const usersList = await users.getUserList({
      emailAddress: userIds,
    });

    if (!usersList || !Array.isArray(usersList)) {
      console.error("Unexpected Clerk response format:", usersList);
      return [];
    }

    const usersData = usersList.map((user) => ({
      id: user.id,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      email: user.emailAddresses?.[0]?.emailAddress || "",
      avatar: user.imageUrl || "",
    }));

    const sortedUsers = userIds.map(
      (email) => usersData.find((user) => user.email === email) || null
    );

    return parseStringify(sortedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

export const getDocumentUsers = async ({
  roomId,
  currentUser,
  text,
}: {
  roomId: string;
  currentUser: string;
  text: string;
}) => {
  try {
    const room = await liveblocks.getRoom(roomId);

    const users = Object.keys(room.usersAccesses).filter(
      (email) => email !== currentUser
    );

    if (text.length) {
      const lowerCaseText = text.toLowerCase();

      const filteredUsers = users.filter((email: string) =>
        email.toLowerCase().includes(lowerCaseText)
      );

      return parseStringify(filteredUsers);
    }

    return parseStringify(users);
  } catch (error) {
    console.log(`Error fetching document users: ${error}`);
  }
};
