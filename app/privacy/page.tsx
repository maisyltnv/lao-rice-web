import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ | ເຂົ້າສານ",
  description:
    "ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວຂອງແອັບ ແລະ ເວັບໄຊ ເຂົ້າສານ (Khaosan) — ການເກັບ ແລະ ໃຊ້ຂໍ້ມູນ.",
};

const UPDATED = "23 ມິຖຸນາ 2026";
const EMAIL = "itcenter@kolaogroup.com";
const WHATSAPP = "020 5569 7625";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-7">
      <h2 className="text-lg font-bold text-[#3D2E1A]">{title}</h2>
      <div className="mt-2 space-y-2 text-[15px] leading-relaxed text-[#4A3D2A]">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#FFFAF5] px-5 py-10 text-[#3D2E1A]">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="text-2xl font-extrabold">ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ</h1>
        <p className="mt-1 text-sm text-[#9A8B78]">
          ເຂົ້າສານ (Khaosan) · ປັບປຸງລ່າສຸດ: {UPDATED}
        </p>

        <p className="mt-5 text-[15px] leading-relaxed text-[#4A3D2A]">
          ແອັບ ແລະ ເວັບໄຊ “ເຂົ້າສານ” (ຕໍ່ໄປນີ້ເອີ້ນວ່າ “ພວກເຮົາ”) ໃຫ້ບໍລິການສັ່ງຊື້ເຂົ້າສານ
          ອອນລາຍ ແລະ ຈັດສົ່ງເຖິງບ້ານ ພາຍໃນນະຄອນຫຼວງວຽງຈັນ. ເອກະສານນີ້ອະທິບາຍວ່າ
          ພວກເຮົາເກັບຂໍ້ມູນຫຍັງ, ໃຊ້ເພື່ອຫຍັງ, ແລະ ທ່ານມີສິດຄວບຄຸມຂໍ້ມູນຂອງທ່ານແນວໃດ.
        </p>

        <Section title="1. ຂໍ້ມູນທີ່ພວກເຮົາເກັບ">
          <ul className="list-disc space-y-1 pl-5">
            <li>ເບີໂທລະສັບ (ສຳລັບເຂົ້າສູ່ລະບົບ ແລະ ຕິດຕໍ່ກ່ຽວກັບຄຳສັ່ງ)</li>
            <li>ຊື່ ແລະ ທີ່ຢູ່ຈັດສົ່ງ</li>
            <li>ຕຳແໜ່ງທີ່ຕັ້ງ (GPS) ເພື່ອກຳນົດຈຸດສົ່ງ ແລະ ຄິດໄລ່ຄ່າສົ່ງ</li>
            <li>ຮູບພາບ (ກ້ອງ/ຄັງຮູບ) — ສຳລັບຮູບໂປຣໄຟລ໌, ສະແກນ QR, ແລະ ຫຼັກຖານການຊຳລະ</li>
            <li>ປະຫວັດການສັ່ງຊື້ ແລະ ລາຍລະອຽດຄຳສັ່ງ</li>
          </ul>
        </Section>

        <Section title="2. ພວກເຮົາໃຊ້ຂໍ້ມູນເພື່ອຫຍັງ">
          <ul className="list-disc space-y-1 pl-5">
            <li>ດຳເນີນການ ແລະ ຈັດສົ່ງຄຳສັ່ງຂອງທ່ານ</li>
            <li>ຢືນຢັນຕົວຕົນ ແລະ ຕິດຕໍ່ກ່ຽວກັບຄຳສັ່ງ/ການຈັດສົ່ງ</li>
            <li>ກວດສອບ ແລະ ຢືນຢັນການຊຳລະເງິນ</li>
            <li>ປັບປຸງການບໍລິການ ແລະ ສະໜັບສະໜູນລູກຄ້າ</li>
          </ul>
        </Section>

        <Section title="3. ການແບ່ງປັນຂໍ້ມູນ">
          <p>
            ພວກເຮົາ <strong>ບໍ່ຂາຍ</strong> ຂໍ້ມູນສ່ວນຕົວຂອງທ່ານ. ພວກເຮົາແບ່ງປັນ
            ສະເພາະເທົ່າທີ່ຈຳເປັນເພື່ອໃຫ້ບໍລິການສຳເລັດ ເຊັ່ນ: ໃຫ້ພະນັກງານ/ຄົນຂັບ
            ເພື່ອຈັດສົ່ງ ແລະ ໃຊ້ກັບການຊຳລະຜ່ານທະນາຄານ (BCEL One QR) ເທົ່ານັ້ນ.
          </p>
        </Section>

        <Section title="4. ການເກັບຮັກສາ ແລະ ຄວາມປອດໄພ">
          <p>
            ຂໍ້ມູນຖືກສົ່ງຜ່ານການເຂົ້າລະຫັດ (HTTPS) ແລະ ເກັບໄວ້ໃນ server ທີ່ມີການປ້ອງກັນ.
            ພວກເຮົາເກັບຮັກສາຂໍ້ມູນພຽງເທົ່າທີ່ຈຳເປັນຕໍ່ການໃຫ້ບໍລິການ ແລະ ຕາມກົດໝາຍ.
          </p>
        </Section>

        <Section title="5. ສິດຂອງທ່ານ ແລະ ການລຶບບັນຊີ">
          <p>
            ທ່ານສາມາດ <strong>ລຶບບັນຊີ ແລະ ຂໍ້ມູນສ່ວນຕົວ</strong> ຂອງທ່ານໄດ້ໂດຍ:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              ໃນແອັບ: ໄປທີ່ <strong>ບັນຊີ → ລຶບບັນຊີ</strong> ແລ້ວຢືນຢັນ — ບັນຊີ ແລະ
              ຂໍ້ມູນສ່ວນຕົວທີ່ກ່ຽວຂ້ອງຈະຖືກລຶບ.
            </li>
            <li>
              ຫຼື ຕິດຕໍ່ພວກເຮົາທີ່ {EMAIL} ຫຼື WhatsApp {WHATSAPP} ເພື່ອຂໍລຶບ.
            </li>
          </ul>
          <p className="text-sm text-[#9A8B78]">
            ໝາຍເຫດ: ຂໍ້ມູນບາງຢ່າງທີ່ກົດໝາຍ/ການບັນຊີຕ້ອງການອາດເກັບໄວ້ໄລຍະໜຶ່ງ
            ໂດຍບໍ່ມີຂໍ້ມູນທີ່ລະບຸຕົວຕົນ.
          </p>
        </Section>

        <Section title="6. ການອະນຸຍາດໃນແອັບ (Permissions)">
          <ul className="list-disc space-y-1 pl-5">
            <li>ຕຳແໜ່ງທີ່ຕັ້ງ — ເພື່ອເລືອກຈຸດສົ່ງ ແລະ ຄິດຄ່າສົ່ງ</li>
            <li>ກ້ອງ — ເພື່ອສະແກນ QR ແລະ ຖ່າຍຮູບໂປຣໄຟລ໌</li>
            <li>ຄັງຮູບ — ເພື່ອເລືອກຮູບໂປຣໄຟລ໌ ຫຼື ຫຼັກຖານການຊຳລະ</li>
          </ul>
        </Section>

        <Section title="7. ຕິດຕໍ່ພວກເຮົາ">
          <p>
            ຫາກມີຄຳຖາມກ່ຽວກັບນະໂຍບາຍນີ້ ຫຼື ຕ້ອງການລຶບຂໍ້ມູນ ຕິດຕໍ່:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>ອີເມວ: {EMAIL}</li>
            <li>WhatsApp: {WHATSAPP}</li>
          </ul>
        </Section>
      </div>
    </main>
  );
}
