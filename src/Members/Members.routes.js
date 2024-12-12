const express = require('express');
const router = express.Router();
const MemberController = require('./Members.controller');

router.post('/add-member', MemberController.addMember);
router.put('/update/:memberId', MemberController.updateMember);
router.delete('/delete/:memberId', MemberController.deleteMember);
router.get('/get-members', MemberController.getMembers);
router.get('/member-profile/:memberId', MemberController.getMemberProfile);
router.post('/borrow', MemberController.borrowBook);
router.post('/return', MemberController.returnBook);
router.get('/borrowed-books/:memberId', MemberController.getMembersBorrowedBooks);
router.post('/subscription', MemberController.subscribeToBook);

module.exports = router;
