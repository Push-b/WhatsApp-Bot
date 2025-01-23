export default {
  name: "test",
  description: "Test Command",
  category: "test",
  isOwner: false,
  run: async (Neko, M) => {
    try {
      if (M.args.includes("--error")) {
        throw new Error("Fake error");
      }
      await Neko.sendMessage(M.from, {
         image:{url:"https://img.freepik.com/free-photo/halloween-scene-illustration-anime-style_23-2151794320.jpg?semt=ais_incoming"}
      },{quoted:M});
    } catch (error) {
      await Neko.error(error);
    }
  },
};
