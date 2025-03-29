CREATE TABLE "parks" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"location" text NOT NULL,
	"image_url" text NOT NULL,
	"score" integer DEFAULT 1500 NOT NULL,
	"previous_ranking" integer
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"winner_park_id" integer NOT NULL,
	"loser_park_id" integer NOT NULL,
	"score_delta" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
