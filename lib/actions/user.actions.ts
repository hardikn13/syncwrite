"use server";

import { users } from "@clerk/clerk-sdk-node"; // Correct Clerk import
import { parseStringify } from "../utils";

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
