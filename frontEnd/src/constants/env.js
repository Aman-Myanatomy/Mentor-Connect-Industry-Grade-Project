export const N_CONF = { API_URL: '{project-id}-api-capstone.myanatomy.ai' };
export const SESSION_TOKEN_KEY = 'mentor-connect.access-token';
export const MESSAGE_MAX_LENGTH = 2000;
export const GOAL_MIN_LENGTH = 10;
export const GOAL_MAX_LENGTH = 1000;

// Same rule as the back-end: only a real Google Meet link (https, meet.google.com, code abc-defg-hij).
export const MEET_URL_REGEX = /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}(\?authuser=\d{1,2})?$/;
export const MEET_NEW_URL = 'https://meet.google.com/new';
