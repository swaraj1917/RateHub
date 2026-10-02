const prisma = require("../config/prisma");

async function getDashboard(req, res) {
  try {
    const ownerId = req.user.id;

    const store = await prisma.store.findUnique({
      where: {
        ownerId,
      },
      include: {
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                address: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!store) {
      return res.status(404).json({
        message: "Store not found for this owner",
      });
    }

    const ratings = store.ratings.map((item) => item.rating);

    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) /
          ratings.length
        : 0;

    const ratedUsers = store.ratings.map((item) => ({
      userId: item.user.id,
      name: item.user.name,
      email: item.user.email,
      address: item.user.address,
      rating: item.rating,
      ratedAt: item.createdAt,
    }));

    return res.status(200).json({
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
      },
      totalUsersRated: ratedUsers.length,
      averageRating: Number(averageRating.toFixed(2)),
      users: ratedUsers,
    });
  } catch (error) {
    console.error("Get owner dashboard error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

module.exports = {
  getDashboard,
};