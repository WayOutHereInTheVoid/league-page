import contentful from "contentful-management";
import { json, error } from "@sveltejs/kit";

import { getLeagueTeamManagers } from "$lib/utils/helper";

const lang = "en-US";

/**
 * Handles SvelteKit POST requests to create and publish a new comment on a blog post entry in Contentful.
 * Requires proper space and management access token environment variables.
 *
 * @param {Object} context - SvelteKit context variables.
 * @param {Request} context.request - HTTP request payload.
 * @param {Object} context.params - Route parameter variables.
 * @param {string} context.params.id - The manager user ID of the comment author.
 * @returns {Promise<Response>} JSON object representing the newly created blog comment entry.
 */
export async function POST({ request, params }) {
  const client = contentful.createClient({
    // This is the access token for this space. Normally you get the token in the Contentful web app
    accessToken: import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN,
  });
  const space = await client
    .getSpace(import.meta.env.VITE_CONTENTFUL_SPACE)
    .catch((e) => {
      console.error(e);
      throw error(500, "Problem getting contentful space");
    });
  const environment = await space.getEnvironment("master").catch((e) => {
    console.error(e);
    throw error(500, "Problem getting contentful environment");
  });

  const authorID = params.id;
  const { comment, postID } = await request.json();

  const leagueTeamManagers = await getLeagueTeamManagers();

  const author = validateID(leagueTeamManagers, authorID);

  if (!author) {
    throw error(500, "Invalid author");
  }

  let fields = {
    blogID: {},
    comment: {},
    author: {},
  };

  fields.blogID[lang] = postID;
  fields.comment[lang] = comment;
  fields.author[lang] = author;

  const newComment = await environment
    .createEntry("blog_comment", { fields })
    .catch((e) => {
      console.error(e);
      throw error(500, "Problem adding comment");
    });

  await newComment.publish().catch((e) => {
    console.error(e);
    throw error(500, "Problem publishing comment");
  });

  // remove lang constraint
  newComment.fields.blogID = postID;
  newComment.fields.comment = comment;
  newComment.fields.author = author;

  return json(newComment);
}

/**
 * Checks that the author ID matches a valid user profile in the league and returns their lowercase username.
 *
 * @param {Object} leagueTeamManagers - Mapped team managers records.
 * @param {string} authorID - The manager user ID to check.
 * @returns {string|boolean} The author username string if valid, else false.
 */
const validateID = (leagueTeamManagers, authorID) => {
  if (leagueTeamManagers.users[authorID]) {
    return leagueTeamManagers.users[authorID].user_name.toLowerCase();
  }

  return false;
};
