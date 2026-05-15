"use client";

import { useState, useEffect, useRef } from "react";

export type Device = "mobile" | "tablet" | "desktop";

export interface DeviceInfo {
  device: Device;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
}

const MOBILE_MAX = 767;
const TABLET_MAX = 1023;

function getDevice(width: number): Device {
  if (width <= MOBILE_MAX) return "mobile";
  if (width <= TABLET_MAX) return "tablet";
  return "desktop";
}

function getDeviceInfo(width: number, height: number): DeviceInfo {
  const device = getDevice(width);
  return {
    device,
    isMobile: device === "mobile",
    isTablet: device === "tablet",
    isDesktop: device === "desktop",
    screenWidth: width,
    screenHeight: height,
  };
}

function getInitialInfo(): DeviceInfo {
  if (typeof window !== "undefined") {
    return getDeviceInfo(window.innerWidth, window.innerHeight);
  }
  return getDeviceInfo(1024, 768); // SSR fallback
}

export function useDevice(): DeviceInfo {
  const [info, setInfo] = useState<DeviceInfo>(getInitialInfo);
  const lastDeviceRef = useRef<Device>(getDevice(typeof window !== "undefined" ? window.innerWidth : 1024));

  useEffect(() => {
    let raf = 0;
    function handleResize() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const newDevice = getDevice(window.innerWidth);
        // Only re-render if the device category actually changed
        if (newDevice !== lastDeviceRef.current) {
          lastDeviceRef.current = newDevice;
          setInfo(getDeviceInfo(window.innerWidth, window.innerHeight));
        }
      });
    }
    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return info;
}
