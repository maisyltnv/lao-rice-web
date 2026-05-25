"use client";

import Link from "next/link";
import { Wheat, Phone, Mail, MapPin, Facebook, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Newsletter Section */}
      <div className="border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-2">ຮັບຂ່າວສານ & ໂປຣໂມຊັນ</h3>
            <p className="text-primary-foreground/80 mb-6">
              ລົງທະບຽນເພື່ອຮັບຂໍ້ມູນກ່ຽວກັບສິນຄ້າໃໝ່ ແລະ ໂປຣໂມຊັນພິເສດ
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="ອີເມວຂອງທ່ານ"
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
              />
              <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                ສະໝັກ
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary-foreground rounded-full flex items-center justify-center">
                <Wheat className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-bold">ຮ້ານເຂົ້າສານ</span>
            </Link>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              ຂາຍເຂົ້າຈ້າວ ເຂົ້າໜຽວ ຄຸນນະພາບດີ — ສັ່ງອອນລາຍ ແລະ ຈັດສົ່ງພາຍໃນນະຄອນຫຼວງວຽງຈັນ.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">ລິ້ງດ່ວນ</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  ສິນຄ້າທັງໝົດ
                </Link>
              </li>
              <li>
                <Link href="/category/supplements" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  ອາຫານເສີມ
                </Link>
              </li>
              <li>
                <Link href="/category/skincare" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  ດູແລຜິວໜັງ
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  ກ່ຽວກັບພວກເຮົາ
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold mb-4">ຊ່ວຍເຫຼືອ</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shipping" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  ການຈັດສົ່ງ
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  ນະໂຍບາຍສົ່ງຄືນ
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  ຄຳຖາມທີ່ພົບເລື້ອຍ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  ຕິດຕໍ່ພວກເຮົາ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">ຕິດຕໍ່</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-primary-foreground/80">
                <Phone className="h-4 w-4" />
                <span>020 5555 1234</span>
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/80">
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp: 020 5555 1234</span>
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/80">
                <Mail className="h-4 w-4" />
                <span>info@healthbeauty.la</span>
              </li>
              <li className="flex items-start gap-2 text-primary-foreground/80">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>ຖະໜົນສາມແສນໄທ, ນະຄອນຫຼວງວຽງຈັນ</span>
              </li>
            </ul>

            <div className="flex items-center gap-3 mt-4">
              <a
                href="#"
                className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/60">
            <p>&copy; 2025 ຮ້ານເຂົ້າສານ. ສະຫງວນລິຂະສິດ.</p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-primary-foreground transition-colors">
                ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ
              </Link>
              <Link href="/terms" className="hover:text-primary-foreground transition-colors">
                ເງື່ອນໄຂການໃຊ້ງານ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
