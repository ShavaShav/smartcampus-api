var router         = require('express').Router();
var auth           = require('../auth');
var {Comment, User, Neode}      = require('../../models');
var utils          = require('../../utils');

router.delete('/:id', auth.required, function(req, res, next){
    const userId = req.user.id;
    const commentId = req.params.id;

    return Comment.findById(commentId).then(comment => {
        if (!comment) {
            return res.status(404).json({error: "Comment not found"});
        }
        const author = comment.get('comment_by');

        if(utils.sameIdentity(author.identity(), userId)) {
            comment.delete().then(() => {
                return res.json({message: "Comment deleted"});
            }).catch(err => {
                return res.status(500).json({
                    error : "Failed to delete a comment. Please try again."
                });
            });
        } else {
            return res.status(401).json({
                error: "Failed to delete comment. Unauthorized."
            });
        }
    });
});
module.exports = router;