"use client";
import React from "react";
import * as FiIcons from "react-icons/fi";

type FiIconProps = {
  icon: keyof typeof FiIcons; // contoh: "FiEdit", "FiTrash2"
  className?: string;
  onClick?: () => void;
  title?: string; // tooltip bawaan browser
};

const FiIconGeneric: React.FC<FiIconProps> = ({
  icon,
  className,
  onClick,
  title,
}) => {
  const IconComponent = FiIcons[icon] as React.ComponentType<{
    className?: string;
    onClick?: () => void;
    title?: string;
  }>;

  if (!IconComponent) return null;

  return (
    <IconComponent
      className={className}
      onClick={onClick}
      title={title} // kasih tooltip langsung
    />
  );
};

export default FiIconGeneric;
