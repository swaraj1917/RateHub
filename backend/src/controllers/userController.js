const prisma = require("../config/prisma");
const { z } = require("zod");

async function listStores(req, res) {
  try {
    const {
      name,
      address,
      sortBy = "name",
      sortOrder = "asc",
    } = req.query;

    const allowedSortFields = [
      "name",
      "address",
      "createdAt",
    ];

    if (!allowedSortFields.includes(sortBy)) {
      return res.status(400).json({
        message: "Invalid sort field",
      });
    }

    if (!["asc", "desc"].includes(sortOrder)) {
      return res.status(400).json({
        message: "Invalid sort order",
      });
    }

    const stores = await prisma.store.findMany({
      where: {
        ...(name && {
          name: {
            contains: name,
            mode: "insensitive",
          },
        }),

        ...(address && {
          address: {
            contains: address,
            mode: "insensitive",
          },
        }),
      },

      include: {
        ratings: {
          select: {
            rating: true,
            userId: true,
          },
        },
      },

      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const currentUserId = req.user.id;

    const formattedStores = stores.map((store) => {
      const ratings = store.ratings.map(
        (item) => item.rating
      );

      const overallRating =
        ratings.length > 0
          ? ratings.reduce(
              (sum, rating) => sum + rating,
              0
            ) / ratings.length
          : 0;

      const currentUserRating = store.ratings.find(
        (item) => item.userId === currentUserId
      );

      return {
        id: store.id,
        name: store.name,
        address: store.address,
        overallRating: Number(
          overallRating.toFixed(2)
        ),
        userRating: currentUserRating
          ? currentUserRating.rating
          : null,
      };
    });

    return res.status(200).json({
      count: formattedStores.length,
      stores: formattedStores,
    });
  } catch (error) {
    console.error("List stores error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

const ratingSchema = z.object({
  rating: z.number().int().min(1).max(5),
});

async function submitRating(req, res) {
  try {
    const storeId = Number(req.params.storeId);

    if (!Number.isInteger(storeId) || storeId <= 0) {
      return res.status(400).json({
        message: "Invalid store ID",
      });
    }

    const validation = ratingSchema.safeParse(
      req.body
    );

    if (!validation.success) {
      return res.status(400).json({
        message:
          "Rating must be an integer between 1 and 5",
      });
    }

    const { rating } = validation.data;

    const store = await prisma.store.findUnique({
      where: {
        id: storeId,
      },
    });

    if (!store) {
      return res.status(404).json({
        message: "Store not found",
      });
    }

    const existingRating =
      await prisma.rating.findUnique({
        where: {
          userId_storeId: {
            userId: req.user.id,
            storeId,
          },
        },
      });

    if (existingRating) {
      return res.status(409).json({
        message:
          "You have already rated this store. Use the modify rating option.",
      });
    }

    const newRating = await prisma.rating.create({
      data: {
        rating,
        userId: req.user.id,
        storeId,
      },
    });

    return res.status(201).json({
      message: "Rating submitted successfully",
      rating: newRating.rating,
    });
  } catch (error) {
    console.error("Submit rating error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

async function modifyRating(req, res) {
  try {
    const storeId = Number(req.params.storeId);

    if (!Number.isInteger(storeId) || storeId <= 0) {
      return res.status(400).json({
        message: "Invalid store ID",
      });
    }

    const validation = ratingSchema.safeParse(
      req.body
    );

    if (!validation.success) {
      return res.status(400).json({
        message:
          "Rating must be an integer between 1 and 5",
      });
    }

    const { rating } = validation.data;

    const existingRating =
      await prisma.rating.findUnique({
        where: {
          userId_storeId: {
            userId: req.user.id,
            storeId,
          },
        },
      });

    if (!existingRating) {
      return res.status(404).json({
        message: "You have not rated this store yet",
      });
    }

    const updatedRating =
      await prisma.rating.update({
        where: {
          userId_storeId: {
            userId: req.user.id,
            storeId,
          },
        },
        data: {
          rating,
        },
      });

    return res.status(200).json({
      message: "Rating updated successfully",
      rating: updatedRating.rating,
    });
  } catch (error) {
    console.error("Modify rating error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

module.exports = {
  listStores,
  submitRating,
  modifyRating,
};