import { MembershipRole, Platform, PostStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_ORG_SLUG = "demo-org";
const DEMO_USER_EMAIL = "demo@example.com";
const DEMO_FB_PROVIDER_ACCOUNT_ID = "demo-fb-user";

async function main() {
  const org = await prisma.organization.upsert({
    where: { slug: DEMO_ORG_SLUG },
    update: {},
    create: { name: "Demo Org", slug: DEMO_ORG_SLUG },
  });

  const user = await prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: {},
    create: {
      email: DEMO_USER_EMAIL,
      name: "Demo User",
      memberships: {
        create: { organizationId: org.id, role: MembershipRole.OWNER },
      },
    },
  });

  const account = await prisma.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: "facebook",
        providerAccountId: DEMO_FB_PROVIDER_ACCOUNT_ID,
      },
    },
    update: {},
    create: {
      userId: user.id,
      type: "oauth",
      provider: "facebook",
      providerAccountId: DEMO_FB_PROVIDER_ACCOUNT_ID,
      access_token: "encrypted:placeholder",
    },
  });

  const pages = await Promise.all(
    [
      { externalId: "page-1", name: "Demo Page One" },
      { externalId: "page-2", name: "Demo Page Two" },
    ].map((page) =>
      prisma.connectedPage.upsert({
        where: {
          organizationId_platform_externalId: {
            organizationId: org.id,
            platform: Platform.FACEBOOK,
            externalId: page.externalId,
          },
        },
        update: { name: page.name, deletedAt: null },
        create: {
          organizationId: org.id,
          accountId: account.id,
          platform: Platform.FACEBOOK,
          externalId: page.externalId,
          name: page.name,
          accessToken: `encrypted:${page.externalId}-token`,
        },
      }),
    ),
  );

  // Posts have no natural unique key, so wipe-and-recreate keeps the seed
  // idempotent without bleeding into the production schema.
  await prisma.post.deleteMany({ where: { organizationId: org.id } });

  await prisma.post.create({
    data: {
      organizationId: org.id,
      authorId: user.id,
      status: PostStatus.DRAFT,
      body: "Draft post one - work in progress",
    },
  });

  await prisma.post.create({
    data: {
      organizationId: org.id,
      authorId: user.id,
      status: PostStatus.DRAFT,
      body: "Draft post two - needs review",
    },
  });

  const runAt = new Date(Date.now() + 60 * 60 * 1000);
  const scheduled = await prisma.post.create({
    data: {
      organizationId: org.id,
      authorId: user.id,
      status: PostStatus.SCHEDULED,
      body: "Scheduled post - fires in 1 hour",
      scheduledAt: runAt,
      targets: {
        create: pages.map((page) => ({ connectedPageId: page.id })),
      },
      jobs: {
        create: { runAt },
      },
    },
  });

  console.log(`Seed complete. org=${org.id} user=${user.id} scheduled=${scheduled.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
