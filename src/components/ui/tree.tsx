"use client";

import { cn } from "@/lib/utils";
import { CompanyAsset } from "@/packages/company/api/companyGetAssets";
import { CompanyLocation } from "@/packages/company/api/companyGetLocations";
import { Roboto } from "next/font/google";
import { ReactNode, UIEventHandler, useMemo, useState } from "react";
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
  id: string;
};

const DEFAULT_ROW_HEIGHT = 24;

export function Tree({
  id,
  nodes,
  itemHeight = DEFAULT_ROW_HEIGHT,
  itemCount,
  height,
}: TreeProps) {
  const [start, setStart] = useState<number>(0);
  const [hidden, setHidden] = useState<Record<string, string>>({});

  const [treeWalker, setTreeWalker] = useState<TreeWalker>();

  const size = Math.floor(height / itemHeight);
  const overScan = Math.floor(size / 2);

  const [tree] = useMemo(
    () =>
      getFlatTree({
        start,
        size,
        id,
        overScan,
        hidden,
        treeWalker:
          treeWalker || TreeWalker({ nodes: nodes as TreeNode_internal[] }),
        onCompute: (treeWalker) => setTreeWalker(treeWalker),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hidden, start]
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
  childrenCount: number;
  depth: number;
};

export type TreeNode = Omit<
  TreeNode_internal,
  "depth" | "children" | "childrenCount"
> & {
  children?: TreeNode[];
};

type TreeWalkerArgs = {
  nodes: TreeNode_internal[];
  tree?: TreeNode_internal[];
  start?: number;
};

type TreeWalker = {
  tree: TreeNode_internal[];
  start: number;
  stack: TreeNode_internal[];
  complete: boolean;
  [Symbol.iterator]: () => Iterator<TreeNode_internal>;
};

const TreeWalker = function TreeWalker(args: TreeWalkerArgs): TreeWalker {
  return {
    stack: args.nodes.filter((node) => !node.parentId),
    start: args.start || 0,
    tree: args.tree || [],
    complete: false,
    [Symbol.iterator]: function () {
      const getTree = () => {
        return this.tree;
      };

      const getStart = () => {
        return this.start;
      };

      const setStart = (start: number) => {
        this.start = start;
      };

      const getStack = () => {
        return this.stack;
      };

      const setComplete = (complete: boolean) => {
        this.complete = complete;
      };

      const getChildrenCount = (node: TreeNode_internal) => {
        if (!node.children) {
          return 0;
        }

        let count = 0;

        for (const child of node.children) {
          count += 1 + getChildrenCount(child);
        }

        return count;
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

          current.childrenCount = getChildrenCount(current);

          if (current.children) {
            for (const child of current.children) {
              stack.push({
                ...child,
                depth: current.depth + 1,
              });
            }
          }

          tree[start] = current;

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
  id: string;
  start: number;
  size: number;
  hidden: Record<string, string>;
  overScan: number;
  treeWalker: TreeWalker;
  onCompute?: (treeWalker: TreeWalker) => void;
};

const getFlatTree = (args: GetFlatTreeArgs) => {
  const treeWalker = args.treeWalker;

  const initialLength = treeWalker.tree.length;
  const end = args.start + args.size + args.overScan;

  const iterator = treeWalker[Symbol.iterator]();
  const chunk: TreeNode_internal[] = [];

  const size = args.size + args.overScan;

  const isHidden = (id: string) =>
    args.hidden[id] !== undefined && args.hidden[id] !== id;

  let i = 0;

  while (i < size) {
    if (i === treeWalker.tree.length && treeWalker.complete) {
      break;
    }

    const getNode = (): TreeNode_internal | null => {
      if (treeWalker.start < end) {
        return iterator.next().value;
      }

      const node = treeWalker.tree[i + args.start];

      if (!node) {
        return null;
      }

      return node;
    };

    const node = getNode();

    if (!node) {
      break;
    }

    if (!isHidden(node.id)) {
      chunk.push(node);
    }

    i++;
  }

  if (treeWalker.tree.length > initialLength) {
    args.onCompute?.(treeWalker);
  }

  return [chunk, treeWalker] as const;
};
