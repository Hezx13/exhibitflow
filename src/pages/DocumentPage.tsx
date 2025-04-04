// @ts-ignore
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { useEditor } from "../hooks/useEditor";
import { useParams } from "react-router-dom";

export default function Editor() {
  const { id } = useParams();
  const { provider, threadStore } = useEditor({ documentId: id || "" });
  const editor = useCreateBlockNote({
    collaboration: {
      provider,
      fragment: provider.document.getXmlFragment("doc"),
      user: {
        name: "John Doe",
        color: "#ff0000",
      },
    },
    resolveUsers: async (userIds) => {
      // sample implementation, replace this with a call to your own user database for example
      return userIds.map((userId) => ({
        id: userId,
        username: "John Doe",
        avatarUrl: "https://placehold.co/100x100",
      }));
    },
    comments: {
      threadStore,
    },
  });

  return <BlockNoteView editor={editor} />;
}
