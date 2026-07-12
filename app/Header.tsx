"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type NavItem = {
  label: string;
  href?: string;
  highlight?: boolean;
  cares?: boolean;
  children?: {
    label: string;
    href: string;
    description: string;
  }[];
};

const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Join the Nation",
    href: "/join",
    highlight: true,
  },
  {
    label: "Store",
    children: [
      {
        label: "Shop All Gear",
        href: "/store",
        description: "Explore the full FAFO Nation gear lineup.",
      },
      {
        label: "Featured Deployments",
        href: "/store/featured",
        description: "Highlighted gear and current featured releases.",
      },
      {
        label: "Collections",
        href: "/store/collections",
        description: "Browse FAFO Nation gear by collection.",
      },
      {
        label: "FAFO Cares",
        href: "/store/fafo-cares",
        description: "Shop merchandise supporting FAFO Cares campaigns.",
      },
    ],
  },
  {
    label: "Community",
    children: [
      {
        label: "FAFO Family",
        href: "/community",
        description: "The people and community behind FAFO Nation.",
      },
      {
        label: "Deployed Members",
        href: "/community/deployed-members",
        description: "Discover members who choose to deploy publicly.",
      },
      {
        label: "Community Activity",
        href: "/