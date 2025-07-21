import { initPlasmicLoader } from "@plasmicapp/loader-react";
export const PLASMIC = initPlasmicLoader({
  projects: [
    {
      id: "vkMFQN5xd2yZKKhxHRz5Wt",  // ID of a project you are using
      token: "Ur698avY9JUtBD84jyCuWepjnzMJ5JxZYdFN5lPK1Msw8V2eLQU2Jh9ssFIXOgobN6CvLX7cnOJ3DnHXakA"  // API token for that project
    }
  ],
  // Fetches the latest revisions, whether or not they were unpublished!
  // Disable for production to ensure you render only published changes.
  preview: true,
})