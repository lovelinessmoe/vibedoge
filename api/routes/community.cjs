const express = require('express');
const communityController = require('../controllers/communityController.cjs');

const router = express.Router();

// 留言相关路由
router.get('/messages', communityController.getMessages);
router.post('/messages', communityController.postMessage);
router.post('/messages/:messageId/like', communityController.likeMessage);

// 话题相关路由
router.get('/topics', communityController.getTopics);
router.get('/topics/:topicId', communityController.getTopic);
router.post('/topics', communityController.createTopic);

module.exports = router;