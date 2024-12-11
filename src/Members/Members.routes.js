const express = require('express');
const router = express.Router();
const MemberController = require('./Members.controller');

router.post('/add-member', (req, res) => MemberController.addMember(req, res));
router.put('/update/:memberId', (req, res) => MemberController.updateMember(req, res));
router.delete('/delete/:memberId', (req, res) => MemberController.deleteMember(req, res));
router.get('/get-members',(req,res)=>MemberController.getMembers(req,res));
module.exports = router;
