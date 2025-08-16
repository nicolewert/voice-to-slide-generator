/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as actions from "../actions.js";
import type * as ai from "../ai.js";
import type * as decks from "../decks.js";
import type * as files from "../files.js";
import type * as notes from "../notes.js";
import type * as sampleData from "../sampleData.js";
import type * as slides from "../slides.js";
import type * as speakerNotesGenerator from "../speakerNotesGenerator.js";
import type * as tasks from "../tasks.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  actions: typeof actions;
  ai: typeof ai;
  decks: typeof decks;
  files: typeof files;
  notes: typeof notes;
  sampleData: typeof sampleData;
  slides: typeof slides;
  speakerNotesGenerator: typeof speakerNotesGenerator;
  tasks: typeof tasks;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
