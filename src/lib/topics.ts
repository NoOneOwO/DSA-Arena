export interface Topic {
  id: string;
  name: string;
  children?: Topic[];
}

export const DSA_TOPICS: Topic[] = [
  { id: "arrays", name: "Arrays" },
  { id: "strings", name: "Strings" },
  { id: "linked-list", name: "Linked List" },
  { id: "stack", name: "Stack" },
  { id: "queue", name: "Queue" },
  { id: "recursion", name: "Recursion" },
  { id: "binary-search", name: "Binary Search" },
  {
    id: "trees",
    name: "Trees",
    children: [
      { id: "binary-tree", name: "Binary Tree" },
      { id: "bst", name: "BST" },
      { id: "traversals", name: "Traversals" },
    ],
  },
  { id: "heap", name: "Heap / Priority Queue" },
  { id: "hashing", name: "Hashing" },
  {
    id: "graphs",
    name: "Graphs",
    children: [
      { id: "bfs", name: "BFS" },
      { id: "dfs", name: "DFS" },
      { id: "shortest-path", name: "Shortest Path" },
    ],
  },
  {
    id: "dynamic-programming",
    name: "Dynamic Programming",
    children: [
      { id: "1d-dp", name: "1D DP" },
      { id: "2d-dp", name: "2D DP" },
      { id: "knapsack", name: "Knapsack" },
    ],
  },
  { id: "greedy", name: "Greedy" },
  { id: "backtracking", name: "Backtracking" },
  { id: "sliding-window", name: "Sliding Window" },
  { id: "two-pointers", name: "Two Pointers" },
  { id: "bit-manipulation", name: "Bit Manipulation" },
];

export function getAllTopicIds(): string[] {
  const ids: string[] = [];
  for (const topic of DSA_TOPICS) {
    ids.push(topic.id);
    if (topic.children) {
      for (const child of topic.children) {
        ids.push(child.id);
      }
    }
  }
  return ids;
}

export function getTopicName(id: string): string {
  for (const topic of DSA_TOPICS) {
    if (topic.id === id) return topic.name;
    if (topic.children) {
      for (const child of topic.children) {
        if (child.id === id) return child.name;
      }
    }
  }
  return id;
}

export function flattenTopics(): { id: string; name: string; parent?: string }[] {
  const flat: { id: string; name: string; parent?: string }[] = [];
  for (const topic of DSA_TOPICS) {
    flat.push({ id: topic.id, name: topic.name });
    if (topic.children) {
      for (const child of topic.children) {
        flat.push({ id: child.id, name: child.name, parent: topic.id });
      }
    }
  }
  return flat;
}
