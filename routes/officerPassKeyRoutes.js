const express = require("express");
const router = express.Router();
const {
    createPassKey,
    listPassKeys,
    getPassKey,
    updatePassKey,
    deletePassKey,
    activatePassKey,
    verifyPassKey,
    forgotPassKey,
    regeneratePassKeyByIdentity,
    regeneratePassKeyById,
    approvePassKey,
    rejectPassKey,
} = require("../controllers/OfficerPassKeyController");

router.post("/officer-pass-keys/verify", verifyPassKey);
router.post("/officer-pass-keys/forgot", forgotPassKey);
router.post("/officer-pass-keys/regenerate", regeneratePassKeyByIdentity);

router.get("/officer-pass-keys/approve/:token", approvePassKey);
router.get("/officer-pass-keys/reject/:token", rejectPassKey);

router.get("/officer-pass-keys", listPassKeys);
router.post("/officer-pass-keys", createPassKey);

router.get("/officer-pass-keys/:id", getPassKey);
router.put("/officer-pass-keys/:id", updatePassKey);
router.delete("/officer-pass-keys/:id", deletePassKey);
router.post("/officer-pass-keys/:id/activate", activatePassKey);
router.post("/officer-pass-keys/:id/regenerate", regeneratePassKeyById);

module.exports = router;
