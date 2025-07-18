import fs from "fs";
import { blankIconSet } from "@iconify/tools";
import { join } from "path";
import { fileURLToPath } from "url";
// import the fonts you want to convert
import {
  fab as faProBrandsIcons,
  prefix as faProBrandsPrefix,
} from "@fortawesome/free-brands-svg-icons";
import {
  far as faProRegularIcons,
  prefix as faProRegularPrefix,
} from "@fortawesome/pro-regular-svg-icons";
import {
  fas as faProSolidIcons,
  prefix as faProSolidPrefix,
} from "@fortawesome/pro-solid-svg-icons";

import {
  fat as faProThinIcons,
  prefix as faProThinPrefix,
} from "@fortawesome/pro-thin-svg-icons";
import {
  fal as faProLightIcons,
  prefix as faProLightPrefix,
} from "@fortawesome/pro-light-svg-icons";

import type { IconifyInfo } from "@iconify/types";

/**
 * Converts Font Awesome Pro icons to Iconify JSON collections.
 * @param options Optional output directory (default: ./font-awesome-iconify)
 */
export function convertFaProToIconifyJson() {
  const icons = [
    { icons: faProBrandsIcons, prefix: faProBrandsPrefix },
    { icons: faProRegularIcons, prefix: faProRegularPrefix },
    { icons: faProSolidIcons, prefix: faProSolidPrefix },
    { icons: faProThinIcons, prefix: faProThinPrefix },
    { icons: faProLightIcons, prefix: faProLightPrefix },
  ] as const;

  // __dirname für ES-Module
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = join(__filename, "..", "..");
  const collectionTargetDir = join(__dirname, "icons");

  console.log(collectionTargetDir)

  const baseInfo = {
    name: "Font Awesome",
    author: {
      name: "Font Awesome",
    },
    license: {
      title: "Commercial License",
      url: "https://fontawesome.com/license",
    },
    height: 512,
  } as const satisfies IconifyInfo;

  for (const iconData of icons) {
    const iconSet = blankIconSet(iconData.prefix);
    iconSet.info = structuredClone(baseInfo);
    for (const def of Object.values(iconData.icons)) {
      // FontAwesome IconDefinition: { iconName: string, icon: [number, number, string[], string, string | string[]] }
      const { iconName, icon } = def as {
        iconName: string;
        icon: [number, number, string[], string, string | string[]];
      };
      const [width, height, ligatures, unicode, svgPathData] = icon;

      const body =
        typeof svgPathData === "string"
          ? `<path fill="currentColor" d="${svgPathData}" />`
          : `<g fill="currentColor">${(svgPathData as string[]).map((x) => `<path d="${x}" />`).join("")}</g>`;

      iconSet.setIcon(iconName, {
        body,
        height,
        width,
      });

      ligatures.forEach((x: string) => {
        if (Number.isNaN(+x)) iconSet.setAlias(x, iconName);
      });
    }

    const data = iconSet.export();
    const dataJson = JSON.stringify(data, null, 2);

    const fileName = join(collectionTargetDir, `${iconData.prefix}.json`);

    fs.mkdirSync(collectionTargetDir, { recursive: true });
    fs.writeFileSync(fileName, dataJson, {
      encoding: "utf-8",
    });
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  convertFaProToIconifyJson();
}
