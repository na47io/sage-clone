// sage clone
// https://instantdb.com/dash?s=main&t=home&app=847f8852-4a41-456f-9f80-e9a68d89cbce

import { i } from "@instantdb/react";

const INSTANT_APP_ID = "847f8852-4a41-456f-9f80-e9a68d89cbce";

const graph = i.graph(
  INSTANT_APP_ID,
  {
    "bio_segments": i.entity({
      "content": i.any(),
      "created_at": i.any(),
      "id": i.any().unique().indexed(),
      "updated_at": i.any(),
    }),
    "bios": i.entity({
      "created_at": i.any(),
      "id": i.any().unique().indexed(),
      "long_text": i.any(),
      "short_text": i.any(),
      "updated_at": i.any(),
    }),
    "chats": i.entity({
      "created_at": i.any(),
      "id": i.any().unique().indexed(),
      "updated_at": i.any(),
    }),
    "messages": i.entity({
      "body": i.any(),
      "created_at": i.any(),
      "id": i.any(),
    }),
    "users": i.entity({
      "created_at": i.any(),
      "email": i.any().unique().indexed(),
      "handle": i.any().unique().indexed(),
      "id": i.any().unique().indexed(),
      "is_online": i.any(),
      "updated_at": i.any(),
    }),
  },
  {
    "bio_segmentsBios": {
      "forward": {
        "on": "bio_segments",
        "has": "many",
        "label": "bios"
      },
      "reverse": {
        "on": "bios",
        "has": "many",
        "label": "bio_segments"
      }
    },
    "chatsMessages": {
      "forward": {
        "on": "chats",
        "has": "many",
        "label": "messages"
      },
      "reverse": {
        "on": "messages",
        "has": "one",
        "label": "chat"
      }
    },
    "usersBio": {
      "forward": {
        "on": "users",
        "has": "one",
        "label": "bio"
      },
      "reverse": {
        "on": "bios",
        "has": "one",
        "label": "user"
      }
    },
    "usersChats": {
      "forward": {
        "on": "users",
        "has": "many",
        "label": "chats"
      },
      "reverse": {
        "on": "chats",
        "has": "many",
        "label": "users"
      }
    }
  }
);

export default graph;
