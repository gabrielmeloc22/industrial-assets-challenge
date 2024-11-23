"use client";

import { MagnifyingClass } from "@/components/icons/magnifying-glass";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Stack } from "@/components/ui/stack";
import { getItemParentId, Tree, TreeNode } from "@/components/ui/tree";
import { withSuspense } from "@/components/util/with-suspense";
import { memoize } from "@/lib/memoize";
import {
  CompanyAsset,
  companyGetAssetsQueryConfig,
} from "@/packages/company/api/companyGetAssets";
import {
  companyGetLocationQueryConfig,
  CompanyLocation,
} from "@/packages/company/api/companyGetLocations";
import { useSuspenseQueries } from "@tanstack/react-query";

type Props = {
  companyId: string;
};

const getTree = memoize(
  (args: {
    companyId: string;
    assets: CompanyAsset[];
    locations: CompanyLocation[];
  }) => {
    const nodes: TreeNode[] = [];
    const roots: TreeNode[] = [];

    for (const asset of args.assets) {
      const parentId = getItemParentId({ asset });
      const node: TreeNode = {
        id: asset.id,
        label: asset.name,
        parentId,
      };

      if (!parentId) {
        roots.push(node);
      }

      nodes.push(node);
    }

    for (const location of args.locations) {
      const parentId = getItemParentId({ location });

      const node: TreeNode = {
        id: location.id,
        label: location.name,
        parentId,
      };

      if (!parentId) {
        roots.push(node);
      }

      nodes.push(node);
    }

    const buildTree = (roots: TreeNode[]) => {
      const tree: TreeNode[] = [];

      for (let i = 0; i < roots.length; i++) {
        const children: TreeNode[] = [];

        for (let j = 0; j < nodes.length; j++) {
          if (nodes[j].parentId === roots[i].id) {
            children.push(nodes[j]);
          }
        }

        tree.push({
          ...roots[i],
          children: children.length ? buildTree(children) : undefined,
        });
      }

      return tree;
    };

    return buildTree(roots);
  },
  (args) => args.companyId
);

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

  const tree = getTree({
    assets: companyAssetsQuery.data,
    locations: companyLocationsQuery.data,
    companyId,
  });

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
          <Tree
            id={companyId}
            nodes={tree}
            height={750}
            itemCount={
              companyAssetsQuery.data.length + companyLocationsQuery.data.length
            }
          />
        </CardContent>
      </Card>
    </Stack>
  );
});
