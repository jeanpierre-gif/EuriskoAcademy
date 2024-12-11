const express = require('express');
const router = express.Router();
const MemberController = require('./Members.controller');

router.post('/add-member', (req, res) => MemberController.addMember(req, res));
router.put('/update/:memberId', (req, res) => MemberController.updateMember(req, res));
router.delete('/delete/:memberId', (req, res) => MemberController.deleteMember(req, res));
router.get('/get-members',(req,res)=>MemberController.getMembers(req,res));
router.get('/member-profile/:memberId', (req, res)=> MemberController.getMemberProfile(req, res));
router.post('/borrow', (req,res)=> MemberController.borrowBook(req, res));
router.post('/return', (req,res)=> MemberController.returnBook(req, res));
router.get('/borrowed-books/:memberId', (req, res)=> MemberController.getMembersBorrowedBooks(req,res));
router.post('/subscription', (req, res)=> MemberController.subscribeToBook(req, res));
module.exports = router;
