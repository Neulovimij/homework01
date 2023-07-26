import express, {Request, Response} from "express";

const app = express()
const port = 3000

app.use(express.json())

type RequestWithParams<P> = Request<P, {}, {}, {}>
type RequestWithBody<B> = Request<{}, {}, B, {}>
type RequestWithParamsBody<P, B> = Request<P, {}, B, {}>

enum AvailableResolutions {
    P144 = "P144",
    P240 = "P240",
    P360 = "P360",
    P480 = "P480",
    P720 = "P720",
    P1080 = "P1080",
    P1440 = "P1440",
    P2160 = "P2160"
}

type VideoType = {
    id: number,
    title: string,
    author: string,
    canBeDownloaded: boolean,
    minAgeRestriction: number | null,
    createdAt: string,
    publicationDate: string,
    availableResolutions: AvailableResolutions[]
}

type ErrorMessageType = {
    message: string
    field: string
}
type ErrorType = {
    errorsMessages: ErrorMessageType[]
}

const videos: VideoType[] = [
    {
        id: 1,
        title: "string",
        author: "string",
        canBeDownloaded: true,
        minAgeRestriction: null,
        createdAt: "2023-07-24T12:54:39.991Z",
        publicationDate: "2023-07-24T12:54:39.991Z",
        availableResolutions: [
            AvailableResolutions.P144
        ]
    }
]

app.get("/videos", (req: Request, res: Response) => {
    res.send(videos)
})
app.get("/videos/:id", (req: RequestWithParams<{ id: number }>, res: Response) => {
    const id = +req.params.id
    const video = videos.find((video) => video.id === id)
    if (!video) {
        res.sendStatus(404)
        return
    }
    res.send(video)
})

app.put("/videos/:id", (req: Request, res: Response) => {
    const id = +req.params.id;
    const video = videos.find((video) => video.id === id);

    if (!video) {
        res.status(404).send("No Video");
        return;
    }

    const { title, author, availableResolutions } = req.body;


    if (!title || !title.length || title.trim().length > 40) {
        res.status(400).send({ message: "Invalid title", field: "title" });
        return;
    }

    if (!author || !author.length || author.trim().length > 20) {
        res.status(400).send({ message: "Invalid author", field: "author" });
        return;
    }

    if (Array.isArray(availableResolutions)) {
        if (!availableResolutions.every((r) => Object.values(AvailableResolutions).includes(r))) {
            res.status(400).send({ message: "Invalid availableResolutions", field: "availableResolutions" });
            return;
        }
    } else {
        res.status(400).send({ message: "Invalid availableResolutions", field: "availableResolutions" });
        return;
    }

    // Обновляем данные видео
    video.title = title;
    video.author = author;
    video.availableResolutions = availableResolutions;

    res.status(204).send(video);
});

app.delete("/videos/:id", (req: RequestWithParams<{ id: number }>, res: Response) => {
    const id = +req.params.id;
    let deletedVideo: VideoType | undefined;

    for (let i = 0; i < videos.length; i++) {
        if (videos[i].id === id) {
            deletedVideo = videos.splice(i, 1)[0];
            break;
        }
    }

    if (!deletedVideo) {
        res.status(404).send("No Video");
        return;
    }

    res.status(204).send(deletedVideo);
});

app.delete("/videos", (req: express.Request, res: express.Response) => {
    if (videos.length === 0) {
        res.status(404).send("No Videos");
        return;
    }

    videos.length = 0; // Очищаем массив videos

    res.status(204).send("All done!");
});


// app.put("/videos/:id", (req: RequestWithParamsBody<{ id: number }, {
//                             title: string,
//                             author: string,
//                             availableResolutions: AvailableResolutions[]
//                         }>
//     , res: Response) => {
//     let errors: ErrorType = {
//         errorsMessages: []
//     }
//     let id = +req.params.id
//
//     let video = videos.find(video => video.id === id)
//
//     if (!video) {
//         res.sendStatus(404)
//         return
//     }
//     let {title, author, availableResolutions} = req.body
//
//     if (!title || !title.length || title.trim().length > 40) {
//         errors.errorsMessages.push({message: "Invalid title", field: "title"})
//     }
//     if (!author || !author.length || author.trim().length > 20) {
//         errors.errorsMessages.push({message: "Invalid author", field: "author"})
//     }
//     if (Array.isArray(availableResolutions)) {
//         availableResolutions.map((r) => {
//             !AvailableResolutions[r] && errors.errorsMessages.push({
//                 message: "Invalid availableResolutions",
//                 field: "availableResolutions"
//             })
//         })
//     } else {
//         availableResolutions = []
//     }
//     if (errors.errorsMessages.length) {
//         res.status(400).send(errors)
//         return
//     }
//     res.status(204).send(video)
// })


app.post("/videos", (req: RequestWithBody<{
                         title: string,
                         author: string,
                         availableResolutions: AvailableResolutions[]
                     }>
    , res: Response) => {
    let errors: ErrorType = {
        errorsMessages: []
    }
    let {title, author, availableResolutions} = req.body
    if (!title || !title.length || title.trim().length > 40) {
        errors.errorsMessages.push({message: "Invalid title", field: "title"})
    }
    if (!author || !author.length || author.trim().length > 20) {
        errors.errorsMessages.push({message: "Invalid author", field: "author"})
    }
    if (Array.isArray(availableResolutions)) {
        availableResolutions.map((r) => {
            !AvailableResolutions[r] && errors.errorsMessages.push({
                message: "Invalid availableResolutions",
                field: "availableResolutions"
            })
        })
    } else {
        availableResolutions = []
    }
    if (errors.errorsMessages.length) {
        res.status(400).send(errors)
        return
    }
    const createdAt = new Date()
    const publicationDate = new Date()

    publicationDate.setDate(createdAt.getDate() + 1)
    const newVideo: VideoType = {
        id: +(new Date()),
        canBeDownloaded: false,
        minAgeRestriction: null,
        createdAt: createdAt.toISOString(),
        publicationDate: publicationDate.toISOString(),
        title,
        author,
        availableResolutions
    }
    videos.push(newVideo)
    res.status(201).send(newVideo)
})

app.listen(port, () => {
    console.log(`Example app listenning on port ${port}`)
})