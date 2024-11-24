"use client";

import { cn } from "@/lib/utils";
import { CompanyAsset } from "@/packages/company/api/companyGetAssets";
import { CompanyLocation } from "@/packages/company/api/companyGetLocations";
import FlexSearch from "flexsearch";
import { Roboto } from "next/font/google";
import {
  ReactNode,
  UIEventHandler,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronDown } from "../icons/chevron-down";

type GetItemParentIdArgs = {
  location?: CompanyLocation;
  asset?: CompanyAsset;
};

export const getItemParentId = (
  args: GetItemParentIdArgs
): string | undefined => {
  return (
    args.location?.parentId ||
    args.asset?.parentId ||
    args.asset?.locationId ||
    undefined
  );
};

const roboto = Roboto({ weight: ["400"], subsets: ["latin"] });

export type TreeProps = {
  nodes: TreeNode[];
  height: number;
  itemHeight?: number;
  itemCount: number;
  search?: string;
};

const DEFAULT_ROW_HEIGHT = 24;

export function Tree({
  nodes,
  itemHeight = DEFAULT_ROW_HEIGHT,
  itemCount,
  height,
  search,
}: TreeProps) {
  const viewport = useRef<HTMLDivElement>(null);

  const [start, setStart] = useState<number>(0);
  const [hidden, setHidden] = useState<Record<string, string>>({});

  const [treeWalker, setTreeWalker] = useState<TreeWalker>();

  const size = Math.floor(height / itemHeight);
  const overScan = Math.floor(size / 2);

  useEffect(() => {
    // setStart(0);
    // viewport.current?.scrollTo({ top: 0 });
  }, [search]);

  const tree = useMemo(
    () =>
      getFlatTree({
        start,
        size,
        overScan,
        hidden,
        search,
        treeWalker:
          treeWalker || TreeWalker({ nodes: nodes as TreeNode_internal[] }),
        onCompute: (treeWalker) => setTreeWalker(treeWalker),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hidden, start, search]
  );

  const handleScroll: UIEventHandler<HTMLDivElement> = (e) => {
    const scrollPercentage =
      e.currentTarget.scrollTop / (itemCount * itemHeight);

    const newStart = Math.floor(scrollPercentage * itemCount);

    setStart(newStart);
  };

  const toggleClose = (node: TreeNode_internal) => {
    const updatedHidden = { ...hidden };
    const isHidden = !!hidden[node.id];

    const getChildren = (node: TreeNode_internal) => {
      const children: TreeNode_internal[] = [];

      if (!node.children) {
        return children;
      }

      for (const child of node.children) {
        children.push(child);
        children.push(...getChildren(child));
      }

      return children;
    };

    const children = getChildren(node);

    // that logic does not preserve nested closed state
    if (!isHidden) {
      updatedHidden[node.id] = node.id;

      for (const child of children) {
        updatedHidden[child.id] = node.id;
      }
    } else {
      delete updatedHidden[node.id];

      for (const child of children) {
        delete updatedHidden[child.id];
      }
    }

    setHidden(updatedHidden);
  };

  return (
    <div
      onScroll={handleScroll}
      className={cn(roboto.className, "overflow-hidden overflow-y-auto")}
      style={{ height, display: "block" }}
      ref={viewport}
    >
      <div
        style={{
          height: itemCount * itemHeight,
          position: "relative",
        }}
      >
        {tree.map((node, i) => (
          <TreeNode
            style={{
              position: "absolute",
              top:
                (Math.max(start - Math.floor(overScan / 2), 0) + i) *
                itemHeight,
            }}
            closed={hidden[node.id] === node.id}
            node={node}
            height={itemHeight}
            key={i}
            toggleClose={() => toggleClose(node)}
          />
        ))}
      </div>
    </div>
  );
}

type TreeNodeProps = {
  height: number;
  node: TreeNode_internal;
  toggleClose: () => void;
  closed: boolean;
  style: React.CSSProperties;
};

function TreeNode({ height, closed, toggleClose, node, style }: TreeNodeProps) {
  const hasChildren = !!node.children?.length;

  return (
    <div
      className="flex flex-col py-1"
      style={{ marginLeft: `${node.depth * 16}px`, height, ...style }}
    >
      <button
        className={cn(
          "inline-flex text-sm gap-2",
          !hasChildren && (node.depth > 0 ? "ml-8" : "ml-1")
        )}
      >
        {hasChildren && (
          <ChevronDown
            size="md"
            onClick={toggleClose}
            className={cn("transition-transform", closed && "rotate-180")}
          />
        )}
        {node.icon}
        {node.label}
      </button>
    </div>
  );
}

type TreeNode_internal = {
  id: string;
  label: string;
  icon?: ReactNode;
  parentId?: string;
  children?: TreeNode_internal[];
  depth: number;
};

export type TreeNode = Omit<TreeNode_internal, "depth" | "children"> & {
  children?: TreeNode[];
};

type TreeWalkerArgs = {
  nodes: TreeNode_internal[];
  tree?: TreeNode_internal[];
  offset?: number;
};

type TreeWalker = {
  tree: TreeNode_internal[];
  offset: number;
  complete: boolean;
  _stack: TreeNode_internal[];
  _idIndex: Record<string, TreeNode_internal>;
  _searchIndex: FlexSearch.Index;
  _addToIndex: (node: TreeNode_internal) => void;
  _getSubtree: (node: TreeNode_internal, size?: number) => TreeNode_internal[];
  search: (args: { value: string; size: number; offset: number }) => {
    nodes: TreeNode_internal[];
    total: number;
  };
  getNode: (id: string) => TreeNode_internal;
  [Symbol.iterator]: () => Iterator<TreeNode_internal>;
};

const TreeWalker = function TreeWalker(args: TreeWalkerArgs): TreeWalker {
  return {
    complete: false,
    offset: args.offset || 0,
    tree: args.tree || [],
    _stack: args.nodes.filter((node) => !node.parentId),
    _searchIndex: new FlexSearch.Index(),
    _idIndex: {},
    _addToIndex: function (node) {
      this._searchIndex.add(node.id, node.label);
      this._idIndex[node.id] = node;
    },
    _getSubtree: function (node, size) {
      let count = 0;

      const getSubtree = (node: TreeNode_internal, depth = 0) => {
        if (count === size) {
          return [];
        }

        const subtree: TreeNode_internal[] = [node];
        count++;

        if (!node.children) {
          return subtree;
        }

        for (const child of node.children) {
          if (count === size) {
            break;
          }
          count++;

          const node = { ...child, depth: depth + 1 };

          subtree.push(...getSubtree(node, depth + 1));
        }

        return subtree;
      };

      return getSubtree(node, node.depth);
    },
    search: function (args) {
      const searchResult = this._searchIndex.search(args.value, {
        offset: args.offset,
        limit: args.size,
      });

      const results: TreeNode_internal[] = [];

      for (const id of searchResult) {
        const node = this._idIndex[id];

        if (node) {
          results.push(node);

          const subtree = this._getSubtree(node, args.size - results.length);

          for (let i = 1; i < subtree.length; i++) {
            const child = subtree[i];

            this._addToIndex(child);
            results.push(child);
          }

          if (results.length === args.size) {
            break;
          }
        }
      }

      return { nodes: results, total: results.length };
    },
    getNode: function (id: string) {
      return this._idIndex[id];
    },
    [Symbol.iterator]: function () {
      const getTree = () => {
        return this.tree;
      };

      const getStart = () => {
        return this.offset;
      };

      const setStart = (start: number) => {
        this.offset = start;
      };

      const getStack = () => {
        return this._stack;
      };

      const setComplete = (complete: boolean) => {
        this.complete = complete;
      };

      const addToIndex = (node: TreeNode_internal) => {
        this._addToIndex(node);
      };

      return {
        next: function () {
          const tree = getTree();
          const stack = getStack();
          const start = getStart();

          const current = stack.pop();

          setStart(start + 1);

          if (!current) {
            setComplete(true);
            return { done: true, value: null };
          }

          if (!current.depth) {
            current.depth = 0;
          }

          if (current.children) {
            for (const child of current.children) {
              const childNode = { ...child, depth: current.depth + 1 };

              addToIndex(childNode);
              stack.push(childNode);
            }
          }

          tree[start] = current;
          addToIndex(current);

          return { done: false, value: current };
        },
      };
    },
  };
};

/**
 *  Returns a flat array representation of the tree given a range
 */
type GetFlatTreeArgs = {
  start: number;
  size: number;
  hidden: Record<string, string>;
  overScan: number;
  treeWalker: TreeWalker;
  search?: string;
  onCompute?: (treeWalker: TreeWalker) => void;
};

const getFlatTree = (args: GetFlatTreeArgs) => {
  const treeWalker = args.treeWalker;

  const initialLength = treeWalker.tree.length;

  const iterator = treeWalker[Symbol.iterator]();
  const chunk: TreeNode_internal[] = [];

  const size = args.size + args.overScan;

  let i = 0;

  const isHidden = (node: TreeNode_internal) =>
    args.hidden[node.id] !== undefined && args.hidden[node.id] !== node.id;

  const getNextNode = (): TreeNode_internal | null => {
    if (!treeWalker.complete) {
      iterator.next();
    }

    const node = treeWalker.tree[i + args.start];

    if (!node) {
      return null;
    }

    return node;
  };

  while (chunk.length < size) {
    const node = getNextNode();
    i++;

    if (!node) {
      break;
    }

    if (args.search) {
      const searchResult = treeWalker.search({
        value: args.search,
        size,
        offset: args.start,
      });

      if (
        (searchResult.nodes.length < size && treeWalker.complete) ||
        searchResult.nodes.length === size
      ) {
        for (const node of searchResult.nodes) {
          chunk.push(node);
        }
        break;
      }

      continue;
    }

    if (isHidden(node)) {
      continue;
    }

    chunk.push(node);
  }

  if (treeWalker.tree.length > initialLength) {
    args.onCompute?.(treeWalker);
  }

  return chunk;
};
