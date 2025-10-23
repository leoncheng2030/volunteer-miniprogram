import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import Components from '@uni-helper/vite-plugin-uni-components'
import { uViewProResolver } from '@uni-helper/vite-plugin-uni-components/resolvers'
export default defineConfig(async () => {
    const UnoCss = await import("unocss/vite").then((i) => i.default);

    return {
        base: '/',
        server: {
            port: 6001,
        },
        plugins: [
            Components({
      resolvers: [uViewProResolver()]
    }),
            uni(),

            // https://github.com/unocss/unocss
            UnoCss(),
        ],
    };
});
