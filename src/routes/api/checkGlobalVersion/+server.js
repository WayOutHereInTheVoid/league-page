import { version } from "$lib/version";
import { json } from "@sveltejs/kit";

/**
 * Handles SvelteKit GET requests to expose the active project version string.
 * This is used as the global checkpoint endpoint.
 *
 * @returns {Promise<Response>} JSON string representing the current project version.
 */
export async function GET() {
  return json(version);
}
