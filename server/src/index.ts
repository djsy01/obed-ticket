import app from "./app";
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`🚀 OBED-ticket server 실행중 ${PORT}`);
})