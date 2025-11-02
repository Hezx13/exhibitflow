import { Request, Response, Router } from 'express';
import List from '../models/List/list.model';
import Document from '../models/Document/Document.model';
import verifyDepartment from 'server/middleware/department';

class SearchService {
  public router = Router();

  constructor() {
    this.initializeRoutes();
    this.router.use(verifyDepartment);
  }

  private initializeRoutes() {
    this.router.get('/', this.globalSearch.bind(this));
  }

  async globalSearch(req: Request, res: Response) {
    try {
      const startTime = Date.now();
      const { query } = req.query;
      const department = req.headers.department as string;
      const searchQuery = (query as string)?.trim();

      if (!searchQuery) {
        return res.status(400).json({ message: 'Search query is required' });
      }

      // Build the base match condition for lists
      const listMatchCondition: any = {
        $and: [
          {
            $or: [
              { name: { $regex: searchQuery, $options: 'i' } },
              { 'tasks.name': { $regex: searchQuery, $options: 'i' } },
              { 'tasks.comment': { $regex: searchQuery, $options: 'i' } },
            ],
          },
        ],
      };

      // Build the base match condition for documents
      const documentMatchCondition: any = {
        $and: [
          {
            $or: [
              { documentName: { $regex: searchQuery, $options: 'i' } },
              { textData: { $regex: searchQuery, $options: 'i' } },
            ],
          },
        ],
      };

      // Add department filter if provided
      if (department) {
        listMatchCondition.$and.push({ department: department });
        documentMatchCondition.$and.push({ department: department });
      }

      // Search in lists and tasks
      const listStartTime = Date.now();
      const listResults = await List.aggregate([
        // Match documents that might contain the search term and match department
        { $match: listMatchCondition },

        // Create two streams: one for lists, one for tasks
        {
          $facet: {
            lists: [
              // Calculate list score based on name match
              {
                $addFields: {
                  score: {
                    $cond: [
                      { $regexMatch: { input: '$name', regex: searchQuery, options: 'i' } },
                      3, // Weight for list name matches
                      0,
                    ],
                  },
                },
              },
              // Only include lists that actually matched
              { $match: { score: { $gt: 0 } } },
              // Project list-level results
              {
                $project: {
                  _id: 1,
                  name: 1,
                  score: 1,
                  type: { $literal: 'list' },
                },
              },
            ],
            tasks: [
              // Unwind tasks array
              { $unwind: '$tasks' },

              // Calculate task score
              {
                $addFields: {
                  taskScore: {
                    $add: [
                      {
                        $cond: [
                          {
                            $regexMatch: { input: '$tasks.name', regex: searchQuery, options: 'i' },
                          },
                          2, // Weight for task text matches
                          0,
                        ],
                      },
                      {
                        $cond: [
                          {
                            $regexMatch: {
                              input: '$tasks.comment',
                              regex: searchQuery,
                              options: 'i',
                            },
                          },
                          1, // Weight for comment matches
                          0,
                        ],
                      },
                    ],
                  },
                },
              },

              // Only include tasks that actually matched
              { $match: { taskScore: { $gt: 0 } } },

              // Project task-level results
              {
                $project: {
                  _id: '$tasks._id',
                  name: '$tasks.name',
                  comment: '$tasks.comment',
                  status: '$tasks.status',
                  listId: '$_id',
                  listName: '$name',
                  type: { $literal: 'task' },
                  score: '$taskScore',
                },
              },
            ],
          },
        },

        // Combine both streams
        {
          $project: {
            combined: { $concatArrays: ['$lists', '$tasks'] },
          },
        },
        { $unwind: '$combined' },
        { $replaceRoot: { newRoot: '$combined' } },
      ]);
      const listEndTime = Date.now();
      const listSearchTime = listEndTime - listStartTime;

      // Search in documents
      const docStartTime = Date.now();
      const documentResults = await Document.aggregate([
        // Match documents that might contain the search term
        { $match: documentMatchCondition },

        // Calculate document score
        {
          $addFields: {
            score: {
              $add: [
                {
                  $cond: [
                    { $regexMatch: { input: '$documentName', regex: searchQuery, options: 'i' } },
                    3, // Weight for document name matches
                    0,
                  ],
                },
                {
                  $cond: [
                    { $regexMatch: { input: '$textData', regex: searchQuery, options: 'i' } },
                    1, // Weight for text data matches
                    0,
                  ],
                },
              ],
            },
          },
        },

        // Only include documents that actually matched
        { $match: { score: { $gt: 0 } } },

        // Project document-level results
        {
          $project: {
            _id: 1,
            name: '$documentName',
            score: 1,
            type: { $literal: 'document' },
          },
        },
      ]);
      const docEndTime = Date.now();
      const docSearchTime = docEndTime - docStartTime;

      // Combine and sort all results
      const sortStartTime = Date.now();
      const combinedResults = [...listResults, ...documentResults].sort(
        (a, b) => b.score - a.score
      );

      // Limit to top 30 results
      const limitedResults = combinedResults.slice(0, 30);
      const sortEndTime = Date.now();
      const sortTime = sortEndTime - sortStartTime;

      const totalTime = Date.now() - startTime;

      // Log performance metrics
      console.log(`Search performance:
        Query: "${searchQuery}"
        List search: ${listSearchTime}ms
        Document search: ${docSearchTime}ms
        Sorting: ${sortTime}ms
        Total time: ${totalTime}ms
      `);

      return res.json({
        count: limitedResults.length,
        results: limitedResults,
      });
    } catch (error: any) {
      console.error('Global search error:', error);
      return res.status(500).json({ message: error.message });
    }
  }
}

const searchRouter = new SearchService();
export default searchRouter.router as Router;
