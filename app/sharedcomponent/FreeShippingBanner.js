"use client";

import React from "react";

export default function FreeShippingBanner({ title, icon, className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {icon} <span>{title}</span>
    </div>
  );
}
