const { UserInputError } = require('apollo-server');
const Post = require('../../models/Post');
const Auth = require('../../utlis/auth');

module.exports = {
    Mutation: {
        createComment: async( _ , {postId,body},context) => {
            const { username } = Auth(context);
            if (body.trim() === '') {
              throw new UserInputError('Empty comment', {
                errors: {
                  body: 'Comment body must not empty'
                }});
            }

            const post = await Post.findById(postId);

            if (post) {
               post.comments.unshift({
               body,
               username,
               createdAt: new Date().toISOString()
               });
               await post.save();
               return post;
            } else throw new UserInputError('Post not found');
        },
        deleteComment: async(_ , {postId,commentId},context) => {
            const {username} = Auth(context);

            const post = await Post.findById(postId);

            if (post) {
              const commentIndex = post.comments.findIndex((c) => c.id === commentId);
      
              if (post.comments[commentIndex].username === username) {
                post.comments.splice(commentIndex, 1);
                await post.save();
                return post;
              } else {
                throw new AuthenticationError('Action not allowed');
              }
            } else {
              throw new UserInputError('Post not found');
            }
        },
        likePost: async(_ , {postId} , context) => {
          const {username} = Auth(context);
          const post = await Post.findById(postId);
          if(post) {
            if(post.likes.find((like) => like.username === username)) {
              //already liked
              post.likes = post.likes.filter((like) => like.username !== username );

            } else {
              //like post 
              post.likes.push({
                username,
                createdAt: new Date().toISOString()
              })
            }
            await post.save();
            return post;
          } else {
            throw new UserInputError('Post not found');
          }
        }
    }
}