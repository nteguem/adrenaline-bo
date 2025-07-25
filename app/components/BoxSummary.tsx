import React from "react";

type Props = { title: string; data: string };

export default function BoxSummary({ title, data }: Props) {
  return (
    <div className="border-2 border-gray-600 pt-6 pl-6 pb-12 pr-20 rounded-[7px] bg-[#141414]">
      <h2 className="text-base">{title}</h2>{" "}
      <p className="text-3xl text-[#0094FE] font-bold">{data}</p>
    </div>
  );
}
