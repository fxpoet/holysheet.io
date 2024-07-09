export default {
    apps: [
        {
            name: 'holysheet',
            script: '.output/server/index.mjs',
            exec_mode: 'fork',
            env: {
                PORT: 8020
            }
        },
    ],
}