"use client";

import { MagnifyingClass } from "@/components/icons/magnifying-glass";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Stack } from "@/components/ui/stack";
import { getItemParentId, Tree, TreeNode } from "@/components/ui/tree";
import { withSuspense } from "@/components/util/with-suspense";
import { companyGetAssetsQueryConfig } from "@/packages/company/api/companyGetAssets";
import { companyGetLocationQueryConfig } from "@/packages/company/api/companyGetLocations";
import { useSuspenseQueries } from "@tanstack/react-query";
import { useMemo } from "react";

type Props = {
  companyId: string;
};

export const CompanyAssetTree = withSuspense<Props>(function CompanyAssetTree({
  companyId,
}) {
  const [companyAssetsQuery, companyLocationsQuery] = useSuspenseQueries({
    queries: [
      {
        ...companyGetAssetsQueryConfig({ companyId }),
      },
      {
        ...companyGetLocationQueryConfig({ companyId }),
      },
    ],
  });

  console.log({ companyAssetsQuery, companyLocationsQuery });

  const treeNodes = useMemo(() => {
    const allNodes: TreeNode[] = [
      ...companyAssetsQuery.data.map((asset) => ({
        id: asset.id,
        label: asset.name,
        parentId: getItemParentId({ asset }),
        data: asset,
      })),
      ...companyLocationsQuery.data.map((location) => ({
        id: location.id,
        label: location.name,
        parentId: getItemParentId({ location }),
        data: location,
      })),
    ].toSorted((nodeA, nodeB) => (nodeA.label < nodeB.label ? 1 : -1));

    const filterAndDelete = <T,>(
      array: T[],
      match: (element: T) => boolean
    ) => {
      const filtered: T[] = [];

      for (let i = 0; i < array.length; i++) {
        if (match(array[i])) {
          filtered.push(...array.splice(i, 1));
        }
      }

      return filtered;
    };

    const buildTree = (nodes: TreeNode[]) => {
      const tree: TreeNode[] = [];

      for (const node of nodes) {
        const children = filterAndDelete(
          allNodes,
          (child) => child.parentId === node.id
        );

        tree.push({
          ...node,
          children: children.length ? buildTree(children) : undefined,
        });
      }

      return tree;
    };

    const rootNodes = allNodes.filter((node) => !node.parentId);

    return buildTree(rootNodes);
  }, [companyAssetsQuery.data, companyLocationsQuery.data]);

  return (
    <Stack className="justify-between w-full">
      <Card className="border-b-0">
        <CardContent className="p-0 pr-4">
          <Input
            placeholder="Buscar Ativo ou Local"
            rightIcon={<MagnifyingClass />}
            className="border-none"
          />
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Tree nodes={treeNodes} height={750} />
        </CardContent>
      </Card>
    </Stack>
  );
});
