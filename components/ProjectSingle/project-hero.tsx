import { ProjectInfoType, ProjectItem } from "@/components/Home/home-projects";
import { Lenis } from "lenis/react";
import { motion } from "motion/react";
import { useRef } from "react";

export default function ProjectHero({
  projectData,
}: {
  projectData: ProjectInfoType;
}) {
  return (
    <Lenis
      data-lenis-prevent
      className="w-screen fixed top-0 left-0 z-[100] pt-28 px-16"
    >
      <ProjectItem {...projectData} />
      <div className="h-[250vh]"></div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full bg-[#000] absolute inset-0 z-0"
      ></motion.div>
    </Lenis>
  );
}
