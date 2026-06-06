import Link from "next/link";
import { Monogram } from "./Monogram";
import { formatRub, formatFrom, variantLabel } from "@/lib/format";
import type { Group, Service } from "@/lib/types";

export function GroupCard({ group }: { group: Group }) {
  const variants =
    group.variants_count > 1
      ? `${group.variants_count} вариантов`
      : `${group.services_count} номиналов`;
  return (
    <Link className="card" href={`/catalog/${group.group_slug}`}>
      <Monogram name={group.base_name} />
      <div className="card-title">{group.base_name}</div>
      <div className="card-sub">{variants}</div>
      <div className="card-price">{formatFrom(group.cheapest_price_kopecks)}</div>
    </Link>
  );
}

export function ProductCard({ service }: { service: Service }) {
  const region = variantLabel(service.category_name);
  return (
    <Link className="card" href={`/product/${service.ns_service_id}`}>
      <Monogram name={service.base_name || service.service_name} />
      <div className="card-title">{service.service_name}</div>
      {region ? <div className="card-sub">{region}</div> : null}
      <div className="card-price">{formatRub(service.rub_price_kopecks)}</div>
    </Link>
  );
}
