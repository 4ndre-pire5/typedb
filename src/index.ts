import { ConnectionManager, Not } from "typeorm"
import { AppDataSource } from "./data-source"
import { Post } from "./entity/Post"
import { User } from "./entity/User"

AppDataSource.initialize().then(async () => {

    console.log("Deleting posts from db...")
    const postsToDelete = await AppDataSource.manager.find(Post, { where: {
        id: Not(0)
    }})
    postsToDelete.forEach(p => AppDataSource.manager.delete(Post, p.id))

    console.log("Deleting users from db...")
    const usersToDelete = await AppDataSource.manager.find(User, { where: {
        id: Not(0)
    }})
    usersToDelete.forEach(u => AppDataSource.manager.delete(User, u.id))


    console.log("Inserting a new user into the database...")
    const user = new User()
    user.firstName = "Timber"
    user.lastName = "Saw"
    user.age = 25
    await AppDataSource.manager.save(user)
    console.log("Saved a new user with id: " + user.id)

    const user2 = new User()
    user2.firstName = "Saw"
    user2.lastName = "Timber"
    user2.age = 30
    await AppDataSource.manager.save(user2)
    console.log("Saved a new user with id: " + user2.id)

    console.log("Inserting a new post into the database...")
    const post = new Post()
    post.title = "New Title"
    post.content = "New content"
    post.user = user
    await AppDataSource.manager.save(post)

    console.log('----------------------------------')
    console.log('-------------queries--------------')
    console.log('----------------------------------')
    console.log("Loading users from the database...")
    const users = await AppDataSource.manager.find(User)
    console.log("Loaded users: ", users)
    console.log("Loaded posts: ")
    users.forEach(u => console.log(u.posts))

    console.log("Left join...")
    const usersLeftJoin = await AppDataSource.manager.find(User, {
        relations: {
            posts: true
        },
    })
    console.log(usersLeftJoin)

    console.log("Inner join...")
    const usersInnerJoin = await AppDataSource.manager.find(User, {
        where: {
            posts: {
                id: Not(0)
            }
        },
        relations: {
            posts: true
        }
    })
    console.log(usersInnerJoin)

    console.log("query builders...")
    console.log("Inner join with query builder...")
    const usersInnerJoinQBuilder = await AppDataSource.manager.createQueryBuilder(User, "user")
        .innerJoinAndSelect("user.posts", "post")
        .where("user.firstName = :name", { name: "Timber"})
        .getMany()
    console.log(usersInnerJoinQBuilder)

    console.log("repository...")
    console.log("using repository to query...")
    const userRepository = AppDataSource.getRepository(User).extend({
        findByName(name: string){
            return this.createQueryBuilder("user")
                .innerJoinAndSelect("user.posts", "post")
                .where("user.firstName = :name", { name })
                .getMany()
        }
    })
    const usersInnerJoinRepository = await userRepository.findByName("Timber")
    console.log(usersInnerJoinRepository)

    console.log("using native queries...")
    const rawData = await AppDataSource.manager.query("select * from user")
    console.log(rawData)

    console.log("Here you can setup and run express / fastify / any other framework.")

}).catch(error => console.log(error))
