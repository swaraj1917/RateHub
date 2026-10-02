const bcrypt = require("bcryptjs");
const { z } = require("zod");

const prisma = require("../config/prisma");

const createUserSchema = z.object({
  name: z.string().min(20).max(60),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .max(16)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),
  address: z.string().max(400),
  role: z.enum(["USER", "ADMIN", "STORE_OWNER"]),
});

async function createUser(req, res) {
  try {
    const validation = createUserSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validation.error.issues,
      });
    }

    const { name, email, password, address, role } = validation.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        address,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.error("Create user error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

const createStoreSchema = z.object({
  name: z.string().min(20).max(60),
  email: z.string().email(),
  address: z.string().max(400),
  ownerId: z.number().int().positive(),
});

async function createStore(req, res) {
  try {
    const validation = createStoreSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validation.error.issues,
      });
    }

    const { name, email, address, ownerId } = validation.data;

    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
    });

    if (!owner) {
      return res.status(404).json({
        message: "Store owner not found",
      });
    }

    if (owner.role !== "STORE_OWNER") {
      return res.status(400).json({
        message: "Selected user is not a store owner",
      });
    }

    const existingStore = await prisma.store.findUnique({
      where: { ownerId },
    });

    if (existingStore) {
      return res.status(409).json({
        message: "This store owner already has a store",
      });
    }

    const existingEmail = await prisma.store.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return res.status(409).json({
        message: "Store email is already registered",
      });
    }

    const store = await prisma.store.create({
      data: {
        name,
        email,
        address,
        ownerId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        ownerId: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      message: "Store created successfully",
      store,
    });
  } catch (error) {
    console.error("Create store error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

async function listUsers(req, res) {
  try {
    const {
      name,
      email,
      address,
      role,
      sortBy = "name",
      sortOrder = "asc",
    } = req.query;

    const allowedSortFields = ["name", "email", "address", "role", "createdAt"];

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

    if (
      role &&
      !["USER", "ADMIN", "STORE_OWNER"].includes(role)
    ) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    const users = await prisma.user.findMany({
      where: {
        ...(name && {
          name: {
            contains: name,
            mode: "insensitive",
          },
        }),

        ...(email && {
          email: {
            contains: email,
            mode: "insensitive",
          },
        }),

        ...(address && {
          address: {
            contains: address,
            mode: "insensitive",
          },
        }),

        ...(role && {
          role,
        }),
      },

      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
      },

      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    return res.status(200).json({
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("List users error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

async function listStores(req, res) {
  try {
    const {
      name,
      email,
      address,
      sortBy = "name",
      sortOrder = "asc",
    } = req.query;

    const allowedSortFields = [
      "name",
      "email",
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

        ...(email && {
          email: {
            contains: email,
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
          },
        },
      },

      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const formattedStores = stores.map((store) => {
      const ratings = store.ratings.map((item) => item.rating);

      const averageRating =
        ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating, 0) /
            ratings.length
          : 0;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        rating: Number(averageRating.toFixed(2)),
        createdAt: store.createdAt,
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

async function getUserDetails(req, res) {
  try {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        ownedStore: {
          include: {
            ratings: {
              select: {
                rating: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const userDetails = {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
    };

    if (user.role === "STORE_OWNER" && user.ownedStore) {
      const ratings = user.ownedStore.ratings.map(
        (item) => item.rating
      );

      const averageRating =
        ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating, 0) /
            ratings.length
          : 0;

      userDetails.store = {
        id: user.ownedStore.id,
        name: user.ownedStore.name,
        email: user.ownedStore.email,
        address: user.ownedStore.address,
        rating: Number(averageRating.toFixed(2)),
      };
    }

    return res.status(200).json({
      user: userDetails,
    });
  } catch (error) {
    console.error("Get user details error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

async function getDashboardStats(req, res) {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
    ]);

    return res.status(200).json({
      totalUsers,
      totalStores,
      totalRatings,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

module.exports = {
  createUser,
  createStore,
  listUsers,
  listStores,
  getUserDetails,
  getDashboardStats,
};