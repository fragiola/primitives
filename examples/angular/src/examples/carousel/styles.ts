import { carousel } from "examples-shared/recipes/carousel";

// The example's classes: the Carousel recipe, and a photo for each slide (a gradient standing for
// the image, with its caption).
const PHOTO =
    "flex h-48 items-end rounded-control p-3 text-white select-none bg-linear-to-br";

export const styles = {
    ...carousel,
    caption: "rounded-control bg-black/60 px-2 py-1 text-sm font-medium",
    photos: {
        lisbon: `${PHOTO} from-amber-500 to-rose-700`,
        kyoto: `${PHOTO} from-pink-400 to-fuchsia-800`,
        reykjavik: `${PHOTO} from-sky-500 to-indigo-800`,
        cusco: `${PHOTO} from-lime-600 to-emerald-800`,
    },
};
