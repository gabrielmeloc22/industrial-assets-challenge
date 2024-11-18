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

export type TreeNode<T = unknown> = {
  id: string;
  label: string;
  icon?: ReactNode;
  parentId?: string;
  children?: TreeNode<T>[];
  depth: number;
  data: T;
};

export type TreeProps<T> = {
  nodes: TreeNode<T>[];
  height: number;
};

type TreeWalkerProps = {
  tree: TreeNode[];
  hidden: Record<string, boolean>;
};

function TreeWalker(args: TreeWalkerProps) {
  const roots = args.tree.filter((node) => !node.parentId);

  return {
    [Symbol.iterator]: function () {
      const stack = roots.toReversed();

      return {
        next: function () {
          const current = stack.pop();

          if (!current) {
            return { done: true, value: null };
          }

          if (!current.depth) {
            current.depth = 0;
          }

          if (current.children && !args.hidden[current.id]) {
            stack.push(
              ...current.children.map((node) => ({
                ...node,
                depth: current.depth + 1,
              }))
            );
          }

          return { done: false, value: current };
        },
      };
    },
  };
}

type GetFlatTreeArgs = {
  nodes: TreeNode[];
  start: number;
  size: number;
  hidden: Record<string, boolean>;
};

const getFlatTree = (args: GetFlatTreeArgs) => {
  const treeWalker = TreeWalker({ tree: args.nodes, hidden: args.hidden });
  const flatTree: TreeNode[] = [];

  let size = 0;

  for (const node of treeWalker) {
    if (!node || size === args.size + args.start) {
      break;
    }

    size++;
    flatTree.push(node);
  }

  return flatTree.slice(args.start, args.start + args.size + 1);
};

const roboto = Roboto({ weight: ["400"] });

type GetTreeSizeArgs = {
  nodes: TreeNode[];
  hidden: Record<string, boolean>;
};

const getTreeSize = (args: GetTreeSizeArgs) => {
  const treeWalker = TreeWalker({ tree: args.nodes, hidden: args.hidden });

  const iterator = treeWalker[Symbol.iterator]();

  let count = 0;

  while (!iterator.next().done) {
    count++;
  }

  return count;
};

export function Tree<T>({ nodes, height }: TreeProps<T>) {
  const [start, setStart] = useState<number>(0);
  const [hidden, setHidden] = useState<Record<string, boolean>>({});

  const treeSize = useMemo(
    () => getTreeSize({ nodes, hidden }),
    [nodes, hidden]
  );

  const virtualTree = useMemo(
    () =>
      getFlatTree({
        nodes,
        start: start,
        size: height / 24,
        hidden,
      }),
    [nodes, start, height, hidden]
  );

  const handleScroll: UIEventHandler<HTMLDivElement> = (e) => {
    const scrollPercentage = e.currentTarget.scrollTop / (treeSize * 24);

    setStart(Math.floor(scrollPercentage * treeSize));
  };

  const toggleClose = (id: string) => {
    setHidden((hidden) => ({ ...hidden, [id]: !hidden[id] }));
  };

  return (
    <div
      onScroll={handleScroll}
      className={cn(roboto.className, "overflow-hidden overflow-y-auto")}
      style={{ height }}
    >
      <div
        style={{ height: (treeSize - start) * 24, marginTop: start * 24 }}
        className="flex flex-col"
      >
        {virtualTree.map((node) => (
          <TreeNode
            closed={hidden[node.id]}
            node={node}
            height={24}
            key={node.id}
            toggleClose={toggleClose}
          />
        ))}
      </div>
    </div>
  );
}

type TreeNodeProps = {
  height: number;
  node: TreeNode;
  toggleClose: (id: string) => void;
  closed: boolean;
};

function TreeNode({ closed, toggleClose, node }: TreeNodeProps) {
  const hasChildren = (node.children?.length || -1) > 0;

  return (
    <div
      className="flex flex-col py-1"
      style={{ marginLeft: `calc(${node.depth} * 1rem)` }}
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
            onClick={() => toggleClose(node.id)}
            className={cn("transition-transform", closed && "rotate-180")}
          />
        )}
        {node.icon}
        {node.label}
      </button>
    </div>
  );
}
