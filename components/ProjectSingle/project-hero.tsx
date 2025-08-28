import { projectInfo } from "@/components/Home/home-projects";
import { ProjectItem } from "@/components/Home/home-projects";
import { motion } from "motion/react";
import Image from "next/image";

export default function ProjectHero({ projectData }: { projectData: any }) {
  return (
    <section className="w-screen min-h-[150vh] pt-32 px-16">
      <ProjectItem {...projectData} />
      <motion.div
        // initial={{ opacity: 0, filter: "blur(16px)" }}
        // animate={{ opacity: 1, filter: "blur(0px)" }}
        // exit={{ opacity: 0, filter: "blur(16px)" }}
        // transition={{ duration: 0.4 }}
        className="w-full mt-8"
      >
        <Image
          src="/static/images/projectHero.png"
          alt=""
          priority
          width={1920}
          height={1080}
          className="w-full h-auto object-contain"
        />
      </motion.div>
    </section>
  );
}
