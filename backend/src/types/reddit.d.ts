/**
 * Type definitions for Reddit MCP server
 */

export interface RedditConfig {
  name: string;
  displayName: string;
  version: string;
  port: number;
  authType: string;
  description: string;
  scopes: string[];
}

export interface RedditCredentials {
  client_id: string;
  client_secret: string;
}

export interface RedditTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
}

export interface RedditUser {
  id: string;
  name: string;
  icon_img?: string;
  link_karma: number;
  comment_karma: number;
  is_gold: boolean;
  is_mod: boolean;
  verified: boolean;
  created_utc: number;
}

export interface RedditPost {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  selftext?: string;
  url?: string;
  score: number;
  ups: number;
  downs: number;
  num_comments: number;
  over_18: boolean;
  spoiler: boolean;
  created_utc: number;
  permalink: string;
}

export interface RedditComment {
  id: string;
  author: string;
  body: string;
  score: number;
  ups: number;
  downs: number;
  parent_id: string;
  created_utc: number;
  permalink: string;
  replies?: RedditComment[];
}

export interface RedditSubreddit {
  id: string;
  display_name: string;
  title: string;
  public_description: string;
  description: string;
  subscribers: number;
  over18: boolean;
  icon_img: string;
  banner_img: string;
  created_utc: number;
}