import { Database, DatabaseConfiguration } from '@hocuspocus/extension-database';
import { Binary, Db, MongoClient } from 'mongodb';
import { config } from 'server/config';
import Document from 'server/models/Document/Document.model';
import { ServerBlockNoteEditor } from '@blocknote/server-util';
import * as Y from 'yjs';
import { convert } from 'html-to-text';
// Import BlockNote types if needed for schema or casting, e.g.:
// import { PartialBlock } from '@blocknote/core';

export interface MongoConfiguration extends DatabaseConfiguration {
  database: string;
  url: string;
}

export class MongoDB extends Database {
  client?: MongoClient;
  db?: Db;
  editor?: ServerBlockNoteEditor;

  configuration: MongoConfiguration = {
    url: config.mongodb.uri,
    database: config.mongodb.dbName,
    fetch: async (data) => {
      const doc = await Document.findById(data.documentName);
      if (doc?.data) {
        const buffer = doc.data.buffer;
        const byteOffset = doc.data.byteOffset;
        const byteLength = doc.data.byteLength;
        return new Uint8Array(buffer, byteOffset, byteLength);
      }
      return null;
    },
    store: async ({ documentName, state }) => {
      console.time(`Storing doc ${documentName}`);
      const stateUint8Array = new Uint8Array(state.buffer, state.byteOffset, state.byteLength);
      const updatePayload: { data: Binary; textData?: string; html?: string } = {
        data: new Binary(stateUint8Array),
      };

      try {
        if (!this.editor) {
            throw new Error('ServerBlockNoteEditor not initialized. Ensure onConfigure has been called.');
        }

        const ydoc = new Y.Doc();
        Y.applyUpdate(ydoc, stateUint8Array);

        const yXmlFragment = ydoc.getXmlFragment('doc');
        if (yXmlFragment && yXmlFragment.length > 0) {

          const blocks = this.editor.yXmlFragmentToBlocks(yXmlFragment);

          if (blocks && blocks.length > 0) {
            const html = await this.editor.blocksToFullHTML(blocks as any);
            const textData = convert(html);

            if (textData && textData.length > 0) {
                 updatePayload.textData = textData;
            }
          }
        }

        await Document.findByIdAndUpdate(
          documentName,
          { $set: updatePayload },
          { upsert: false }
        );

      } catch (error) {
        console.error(`[MongoDB Store] Error processing or storing document ${documentName}:`, error);
        try {
          await Document.findByIdAndUpdate(
            documentName,
            { $set: { data: updatePayload.data } },
            { upsert: false }
          );
        } catch (saveError) {
          console.error(`[MongoDB Store] Error saving binary data for document ${documentName} after text conversion failure:`, saveError);
        }
      } finally {
          console.timeEnd(`Storing doc ${documentName}`);
      }
    },
  };

  constructor(configuration?: Partial<MongoConfiguration>) {
    super({});
    this.configuration = {
      ...this.configuration,
      ...configuration,
    };
  }

  async onConfigure() {
    this.client = new MongoClient(this.configuration.url);
    this.db = this.client.db(this.configuration.database);
    await this.client.connect();
    this.editor = ServerBlockNoteEditor.create();
  }

  async onDestroy() {
    await this.client?.close();
  }
}
