const Post = require('../../models/Post');
const Auth = require('../../utlis/auth');

module.exports = {
    Query: {
        async getPosts(){
            try{
                const posts = await Post.find();
                return posts;
            }
            catch(error) {
                console.log(error);
            }
        },
        async getPost( _ , {postId}) {
            try{
                const post = await Post.findById(postId);
                if(post){
                    return post;
                }
                else {
                    throw new Error('Post does not exist');
                }
            }
            catch(err) {
                throw new Error(error);
            }
        }   
    },
    Mutation: {
        async createPost(_ , { body} , context) {
            const user = Auth(context);
            if (body.trim() === '') {
                throw new Error('Post body must not be empty');
            }
        
            const newPost = new Post({
                body,
                user:user.id,
                createdAt: new Date().toISOString(),
                username: user.username
            })

            const post = await newPost.save();

            return post;
        },
        async deletePost( _ , {postId},context) {
            const user = Auth(context);
            try {
                const post = await Post.findById(postId);
                if(post.username === user.username) {
                    await post.delete();
                    return 'Post Deleted Successfully';
                } else{
                    throw new Error('Action not allowed');
                }
            }
            catch(error) {
                throw new Error(error);
            }
        }
    }
}