/**
 * Page component registry
 * Imports all page components to ensure they are registered as Web Components
 * This allows pages.ts to create them without dynamic imports
 */

// Import all page components to trigger their registration
import "./menu/main.ts";
import "./settings/main.ts";
import "./powerups/main.ts";
import "./quickstart/main.ts";
import "./leaderboard/main.ts";
