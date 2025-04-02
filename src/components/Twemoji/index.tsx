import { memo } from "react";
import twemoji from "@twemoji/api";

import classes from "./index.module.css";

interface TwemojiProps {
  content: string;
}
const Twemoji = ({ content }: TwemojiProps) => (
  <span
    className={classes.wrapper}
    dangerouslySetInnerHTML={{
      __html: twemoji.parse(content, {
        folder: "svg",
        ext: ".svg",
      }),
    }}
  />
);

export default memo(Twemoji);
