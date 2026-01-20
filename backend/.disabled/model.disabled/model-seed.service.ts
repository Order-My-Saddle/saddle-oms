import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ModelEntity } from "../../../../../../models/infrastructure/persistence/relational/entities/model.entity";
import { ModelStatus } from "../../../../../../models/domain/value-objects/model-status.value-object";

@Injectable()
export class ModelSeedService {
  constructor(
    @InjectRepository(ModelEntity)
    private repository: Repository<ModelEntity>,
  ) {}

  async run() {
    const models = [
      // Tack Premium Models
      {
        id: "aa0e8400-e29b-41d4-a716-446655440001",
        brandId: "990e8400-e29b-41d4-a716-446655440001", // Tack Premium
        name: "Royal Dressage",
        description:
          "Premium dressage saddle with deep seat and long flaps for optimal position and elegance.",
        imageUrl: "https://cdn.omsaddle.com/models/royal-dressage.jpg",
        basePrice: 4500.0,
        isCustomizable: true,
        status: ModelStatus.ACTIVE,
        createdBy: "550e8400-e29b-41d4-a716-446655440001", // admin
      },
      {
        id: "aa0e8400-e29b-41d4-a716-446655440002",
        brandId: "990e8400-e29b-41d4-a716-446655440001", // Tack Premium
        name: "Elite Hunter",
        description:
          "Close contact jumping saddle with forward flaps and secure seat for show hunters and equitation.",
        imageUrl: "https://cdn.omsaddle.com/models/elite-hunter.jpg",
        basePrice: 4200.0,
        isCustomizable: true,
        status: ModelStatus.ACTIVE,
        createdBy: "550e8400-e29b-41d4-a716-446655440001", // admin
      },

      // Custom Elite Models
      {
        id: "aa0e8400-e29b-41d4-a716-446655440003",
        brandId: "990e8400-e29b-41d4-a716-446655440002", // Custom Elite
        name: "Bespoke Dressage",
        description:
          "Fully customizable dressage saddle tailored to rider and horse measurements.",
        imageUrl: "https://cdn.omsaddle.com/models/bespoke-dressage.jpg",
        basePrice: 6500.0,
        isCustomizable: true,
        status: ModelStatus.ACTIVE,
        createdBy: "550e8400-e29b-41d4-a716-446655440001", // admin
      },
      {
        id: "aa0e8400-e29b-41d4-a716-446655440004",
        brandId: "990e8400-e29b-41d4-a716-446655440002", // Custom Elite
        name: "Made-to-Measure Jumper",
        description:
          "Custom jumping saddle designed specifically for your horse's conformation and your riding style.",
        imageUrl: "https://cdn.omsaddle.com/models/mtm-jumper.jpg",
        basePrice: 6200.0,
        isCustomizable: true,
        status: ModelStatus.ACTIVE,
        createdBy: "550e8400-e29b-41d4-a716-446655440001", // admin
      },

      // Heritage Classic Models
      {
        id: "aa0e8400-e29b-41d4-a716-446655440005",
        brandId: "990e8400-e29b-41d4-a716-446655440003", // Heritage Classic
        name: "Traditional All-Purpose",
        description:
          "Classic English all-purpose saddle suitable for multiple disciplines with timeless design.",
        imageUrl: "https://cdn.omsaddle.com/models/traditional-ap.jpg",
        basePrice: 3200.0,
        isCustomizable: false,
        status: ModelStatus.ACTIVE,
        createdBy: "550e8400-e29b-41d4-a716-446655440001", // admin
      },
      {
        id: "aa0e8400-e29b-41d4-a716-446655440006",
        brandId: "990e8400-e29b-41d4-a716-446655440003", // Heritage Classic
        name: "Oxford Hunter",
        description:
          "Traditional hunter saddle with classic lines and proven performance in the show ring.",
        imageUrl: "https://cdn.omsaddle.com/models/oxford-hunter.jpg",
        basePrice: 3500.0,
        isCustomizable: false,
        status: ModelStatus.ACTIVE,
        createdBy: "550e8400-e29b-41d4-a716-446655440001", // admin
      },

      // Dressage Masters Models
      {
        id: "aa0e8400-e29b-41d4-a716-446655440007",
        brandId: "990e8400-e29b-41d4-a716-446655440004", // Dressage Masters
        name: "Grand Prix Pro",
        description:
          "Professional dressage saddle designed for upper-level movements with maximum contact and communication.",
        imageUrl: "https://cdn.omsaddle.com/models/grand-prix-pro.jpg",
        basePrice: 5200.0,
        isCustomizable: true,
        status: ModelStatus.ACTIVE,
        createdBy: "550e8400-e29b-41d4-a716-446655440001", // admin
      },
      {
        id: "aa0e8400-e29b-41d4-a716-446655440008",
        brandId: "990e8400-e29b-41d4-a716-446655440004", // Dressage Masters
        name: "Training Level",
        description:
          "Dressage saddle perfect for training level riders with supportive seat and balanced position.",
        imageUrl: "https://cdn.omsaddle.com/models/training-level.jpg",
        basePrice: 3800.0,
        isCustomizable: true,
        status: ModelStatus.ACTIVE,
        createdBy: "550e8400-e29b-41d4-a716-446655440001", // admin
      },

      // Jump Pro Models
      {
        id: "aa0e8400-e29b-41d4-a716-446655440009",
        brandId: "990e8400-e29b-41d4-a716-446655440005", // Jump Pro
        name: "Stadium Master",
        description:
          "Show jumping saddle with forward seat and excellent grip for tackling large fences.",
        imageUrl: "https://cdn.omsaddle.com/models/stadium-master.jpg",
        basePrice: 4800.0,
        isCustomizable: true,
        status: ModelStatus.ACTIVE,
        createdBy: "550e8400-e29b-41d4-a716-446655440001", // admin
      },
      {
        id: "aa0e8400-e29b-41d4-a716-446655440010",
        brandId: "990e8400-e29b-41d4-a716-446655440005", // Jump Pro
        name: "Speed Derby",
        description:
          "Lightweight jumping saddle optimized for speed classes and derby competitions.",
        imageUrl: "https://cdn.omsaddle.com/models/speed-derby.jpg",
        basePrice: 4400.0,
        isCustomizable: true,
        status: ModelStatus.ACTIVE,
        createdBy: "550e8400-e29b-41d4-a716-446655440001", // admin
      },

      // Western Legend Models
      {
        id: "aa0e8400-e29b-41d4-a716-446655440011",
        brandId: "990e8400-e29b-41d4-a716-446655440006", // Western Legend
        name: "Ranch Work",
        description:
          "Heavy-duty ranch saddle built for all-day comfort and durability in working conditions.",
        imageUrl: "https://cdn.omsaddle.com/models/ranch-work.jpg",
        basePrice: 2800.0,
        isCustomizable: false,
        status: ModelStatus.ACTIVE,
        createdBy: "550e8400-e29b-41d4-a716-446655440001", // admin
      },
      {
        id: "aa0e8400-e29b-41d4-a716-446655440012",
        brandId: "990e8400-e29b-41d4-a716-446655440006", // Western Legend
        name: "Show Reiner",
        description:
          "Specialized reining saddle with deep seat and secure leg position for spinning and sliding stops.",
        imageUrl: "https://cdn.omsaddle.com/models/show-reiner.jpg",
        basePrice: 3500.0,
        isCustomizable: true,
        status: ModelStatus.ACTIVE,
        createdBy: "550e8400-e29b-41d4-a716-446655440001", // admin
      },

      // Eventing Edge Models
      {
        id: "aa0e8400-e29b-41d4-a716-446655440013",
        brandId: "990e8400-e29b-41d4-a716-446655440007", // Eventing Edge
        name: "Three-Phase Pro",
        description:
          "Versatile eventing saddle that performs excellently across all three phases of eventing.",
        imageUrl: "https://cdn.omsaddle.com/models/three-phase-pro.jpg",
        basePrice: 4600.0,
        isCustomizable: true,
        status: ModelStatus.ACTIVE,
        createdBy: "550e8400-e29b-41d4-a716-446655440001", // admin
      },
      {
        id: "aa0e8400-e29b-41d4-a716-446655440014",
        brandId: "990e8400-e29b-41d4-a716-446655440007", // Eventing Edge
        name: "Cross Country Elite",
        description:
          "Secure cross-country saddle designed for galloping over solid fences at speed.",
        imageUrl: "https://cdn.omsaddle.com/models/xc-elite.jpg",
        basePrice: 4200.0,
        isCustomizable: true,
        status: ModelStatus.ACTIVE,
        createdBy: "550e8400-e29b-41d4-a716-446655440001", // admin
      },

      // École Française Models
      {
        id: "aa0e8400-e29b-41d4-a716-446655440015",
        brandId: "990e8400-e29b-41d4-a716-446655440008", // École Française
        name: "Haute École",
        description:
          "Classical dressage saddle designed for high school movements and traditional French riding.",
        imageUrl: "https://cdn.omsaddle.com/models/haute-ecole.jpg",
        basePrice: 5800.0,
        isCustomizable: true,
        status: ModelStatus.ACTIVE,
        createdBy: "550e8400-e29b-41d4-a716-446655440001", // admin
      },
      {
        id: "aa0e8400-e29b-41d4-a716-446655440016",
        brandId: "990e8400-e29b-41d4-a716-446655440008", // École Française
        name: "Classical Training",
        description:
          "Traditional French training saddle for developing classical riding skills and horse training.",
        imageUrl: "https://cdn.omsaddle.com/models/classical-training.jpg",
        basePrice: 4200.0,
        isCustomizable: true,
        status: ModelStatus.ACTIVE,
        createdBy: "550e8400-e29b-41d4-a716-446655440001", // admin
      },

      // Starter Saddles Models
      {
        id: "aa0e8400-e29b-41d4-a716-446655440017",
        brandId: "990e8400-e29b-41d4-a716-446655440011", // Starter Saddles
        name: "Beginner All-Purpose",
        description:
          "Safe and comfortable all-purpose saddle perfect for new riders learning basic skills.",
        imageUrl: "https://cdn.omsaddle.com/models/beginner-ap.jpg",
        basePrice: 1800.0,
        isCustomizable: false,
        status: ModelStatus.ACTIVE,
        createdBy: "550e8400-e29b-41d4-a716-446655440001", // admin
      },
      {
        id: "aa0e8400-e29b-41d4-a716-446655440018",
        brandId: "990e8400-e29b-41d4-a716-446655440011", // Starter Saddles
        name: "Youth Special",
        description:
          "Sized appropriately for young riders with enhanced safety features and supportive design.",
        imageUrl: "https://cdn.omsaddle.com/models/youth-special.jpg",
        basePrice: 1600.0,
        isCustomizable: false,
        status: ModelStatus.ACTIVE,
        createdBy: "550e8400-e29b-41d4-a716-446655440001", // admin
      },

      // Trail Master Models
      {
        id: "aa0e8400-e29b-41d4-a716-446655440019",
        brandId: "990e8400-e29b-41d4-a716-446655440013", // Trail Master
        name: "Endurance Pro",
        description:
          "Lightweight endurance saddle designed for 50+ mile competitions with maximum comfort.",
        imageUrl: "https://cdn.omsaddle.com/models/endurance-pro.jpg",
        basePrice: 3200.0,
        isCustomizable: true,
        status: ModelStatus.ACTIVE,
        createdBy: "550e8400-e29b-41d4-a716-446655440001", // admin
      },
      {
        id: "aa0e8400-e29b-41d4-a716-446655440020",
        brandId: "990e8400-e29b-41d4-a716-446655440013", // Trail Master
        name: "Mountain Explorer",
        description:
          "Rugged trail saddle built for challenging terrain and multi-day wilderness adventures.",
        imageUrl: "https://cdn.omsaddle.com/models/mountain-explorer.jpg",
        basePrice: 2900.0,
        isCustomizable: true,
        status: ModelStatus.ACTIVE,
        createdBy: "550e8400-e29b-41d4-a716-446655440001", // admin
      },

      // Discontinued model for testing
      {
        id: "aa0e8400-e29b-41d4-a716-446655440021",
        brandId: "990e8400-e29b-41d4-a716-446655440015", // Legacy Craft
        name: "Vintage Classic",
        description:
          "Historic saddle model, no longer in production. Collectible value for vintage enthusiasts.",
        imageUrl: "https://cdn.omsaddle.com/models/vintage-classic.jpg",
        basePrice: 2500.0,
        isCustomizable: false,
        status: ModelStatus.DISCONTINUED,
        createdBy: "550e8400-e29b-41d4-a716-446655440001", // admin
      },

      // Pending model for testing
      {
        id: "aa0e8400-e29b-41d4-a716-446655440022",
        brandId: "990e8400-e29b-41d4-a716-446655440016", // New Horizon
        name: "Future Tech",
        description:
          "Revolutionary saddle design with advanced materials, pending final testing and approval.",
        imageUrl: "https://cdn.omsaddle.com/models/future-tech.jpg",
        basePrice: 7500.0,
        isCustomizable: true,
        status: ModelStatus.PENDING,
        createdBy: "550e8400-e29b-41d4-a716-446655440001", // admin
      },
    ];

    for (const modelData of models) {
      try {
        // Check if model already exists
        const existingModel = await this.repository.findOne({
          where: { name: modelData.name },
        });

        if (!existingModel) {
          // Create model
          const model = this.repository.create({
            name: modelData.name,
            brandLegacyId: Number(modelData.brandId) || 1,
          });

          await this.repository.save(model);
          console.log(
            `✅ Created model: ${modelData.name} (${modelData.status}) - $${modelData.basePrice}`,
          );
        } else {
          console.log(
            `⚠️  Model already exists: ${modelData.name} for brand ${modelData.brandId}`,
          );
        }
      } catch (error) {
        console.error(
          `❌ Error creating model ${modelData.name}:`,
          error.message,
        );
      }
    }
  }
}
